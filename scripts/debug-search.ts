/**
 * 自由文検索パイプラインの段階別デバッグスクリプト
 *
 * 実行:
 *   npx tsx scripts/debug-search.ts "박사후연구원"
 *   npx tsx scripts/debug-search.ts "postdoc"
 *
 * 目的:
 *   本番 searchListings と同じ手順を1段ずつ実行し、どの段で検索が切れているかを特定する。
 *
 * 注意（このリポジトリの現状）:
 *   フェーズ2で想定された「埋め込みベクトル + match_listings RPC + FTS/コサイン/RRF」は
 *   まだこのリポジトリに存在しない。自由文検索は次の1経路のみ:
 *       translateQuery(DeepL) → expandSynonyms(同義語展開) → ILIKE .or() 横断検索
 *   そのため段2/3/4は「埋め込み経路」ではなく、実在する ILIKE 経路を可視化する。
 *
 * 認証情報:
 *   .env.local から NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DEEPL_API_KEY を読む。
 *   （キーの値は一切表示しない）
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
// 実在する“本物”の同義語展開ロジックをそのまま使う（純粋モジュール・server-only 非依存）
import { expandSynonyms } from "../src/lib/searchSynonyms";

// ---- .env.local を実行時に自分で読む（--env-file の有無に依存しないため）----------
function loadEnvLocal(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // .env.local が無くても、既に環境変数が入っていれば動く
  }
}

// ---- 本番 listings.ts と同一のロジックを鏡写しにした定数/関数 ----------------------
// （debug 用に再掲。src/lib/listings.ts と一致していること）
const SEARCH_TEXT_COLUMNS = [
  "title_ja",
  "title_en",
  "title_zh",
  "title_ko",
  "summary_ja",
  "summary_en",
  "summary_zh",
  "summary_ko",
] as const;

function sanitizeForOr(term: string): string {
  return term.replace(/[,()%_\\]/g, " ").trim();
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- 本番 translate.ts の translateQuery を鏡写し（source を省略し自動判定）----------
const DEEPL_TARGET: Record<"ja" | "en", string> = { ja: "JA", en: "EN-US" };

async function translateQuery(
  text: string,
  target: "ja" | "en"
): Promise<{ value: string | null; detail: string }> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return { value: null, detail: "DEEPL_API_KEY 未設定" };

  const endpoint = key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        // source_lang は送らない（韓国語・中国語も自動判定させる）
        target_lang: DEEPL_TARGET[target],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return {
        value: null,
        detail: `DeepL HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
      };
    }
    const json = (await res.json()) as {
      translations?: { text: string; detected_source_language?: string }[];
    };
    const t = json.translations?.[0];
    if (!t) return { value: null, detail: "DeepL 応答に翻訳なし" };
    return {
      value: t.text,
      detail: `検出言語=${t.detected_source_language ?? "?"}`,
    };
  } catch (e) {
    return { value: null, detail: `DeepL 例外: ${String(e)}` };
  }
}

// ---- 検索語配列の組み立て（listings.ts と同一手順）-------------------------------
type BuildResult = {
  original: string;
  jaTranslation: { value: string | null; detail: string } | null;
  enTranslation: { value: string | null; detail: string } | null;
  synonymAdded: string[];
  terms: string[]; // 上限適用後（実際に検索に使う語）
  cappedFrom: number; // 上限適用前の語数
};

async function buildSearchTerms(rawKeywordInput: string): Promise<BuildResult> {
  const rawKeyword = rawKeywordInput.trim();
  const terms = new Set<string>();
  const addTerm = (t: string | null | undefined) => {
    if (!t) return;
    const s = sanitizeForOr(t);
    if (s) terms.add(s);
  };
  addTerm(rawKeyword);

  let jaTranslation: BuildResult["jaTranslation"] = null;
  let enTranslation: BuildResult["enTranslation"] = null;

  // 翻訳スキップ条件: 2文字未満・100文字超
  if (rawKeyword.length >= 2 && rawKeyword.length <= 100) {
    const [ja, en] = await Promise.all([
      translateQuery(rawKeyword, "ja"),
      translateQuery(rawKeyword, "en"),
    ]);
    jaTranslation = ja;
    enTranslation = en;
    addTerm(ja.value);
    addTerm(en.value);
  }

  const beforeSynonyms = new Set(terms);
  const synonymWords = expandSynonyms(terms);
  for (const w of synonymWords) addTerm(w);
  const synonymAdded = [...terms].filter((t) => !beforeSynonyms.has(t));

  const MAX_TERMS = 15;
  const all = [...terms];
  const capped = all.slice(0, MAX_TERMS);

  return {
    original: rawKeyword,
    jaTranslation,
    enTranslation,
    synonymAdded,
    terms: capped,
    cappedFrom: all.length,
  };
}

// ---- ヘルパ: ある行のどのカラムがどの語にヒットしたか -------------------------------
type Row = Record<string, string | null>;

function matchedColumns(row: Row, terms: string[]): string[] {
  const hits: string[] = [];
  for (const col of SEARCH_TEXT_COLUMNS) {
    const val = (row[col] ?? "").toLowerCase();
    if (!val) continue;
    for (const term of terms) {
      if (val.includes(term.toLowerCase())) {
        hits.push(`${col}⊃"${term}"`);
        break;
      }
    }
  }
  return hits;
}

const section = (n: number, title: string) =>
  console.log(`\n${"=".repeat(70)}\n【段${n}】${title}\n${"=".repeat(70)}`);

async function main() {
  loadEnvLocal();

  const query = process.argv[2];
  if (!query) {
    console.error('使い方: npx tsx scripts/debug-search.ts "検索クエリ"');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "NG: .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です。"
    );
    process.exit(1);
  }
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log(`\nクエリ: ${JSON.stringify(query)}`);
  console.log(
    `キー有無: SUPABASE=${Boolean(serviceKey)} DEEPL=${Boolean(process.env.DEEPL_API_KEY)} 基準日(UTC)=${todayUtc()}`
  );

  // ---- 段1: クエリ翻訳（日・英）--------------------------------------------------
  section(1, "クエリ翻訳（translateQuery, source自動判定）");
  const built = await buildSearchTerms(query);
  const jt = built.jaTranslation;
  const et = built.enTranslation;
  console.log(
    `日訳(ja): ${jt ? (jt.value ?? "❌ DeepL失敗") : "(翻訳スキップ: 2文字未満/100文字超)"}` +
      (jt ? `   [${jt.detail}]` : "")
  );
  console.log(
    `英訳(en): ${et ? (et.value ?? "❌ DeepL失敗") : "(翻訳スキップ: 2文字未満/100文字超)"}` +
      (et ? `   [${et.detail}]` : "")
  );
  console.log(`同義語展開で追加: ${JSON.stringify(built.synonymAdded)}`);
  console.log(
    `最終検索語(${built.terms.length}語 / 上限15・展開前${built.cappedFrom}語): ${JSON.stringify(built.terms)}`
  );

  // ---- 段2: 埋め込み生成（このリポジトリでは未実装）--------------------------------
  section(2, "埋め込み生成 generateEmbedding(query_en)");
  console.log(
    "⏭  SKIP: generateEmbedding / 埋め込みベクトル検索はこのリポジトリに存在しません。"
  );
  console.log(
    "   （supabase/functions・pgvector・embedding カラムなし。フェーズ2は未導入。）"
  );

  // ---- 段3: 検索本体（RPCではなく実在する ILIKE .or() 経路）------------------------
  section(3, "検索本体（match_listings RPC は無し → 実在の ILIKE .or() 上位10件）");
  const orClause = built.terms
    .flatMap((term) => SEARCH_TEXT_COLUMNS.map((c) => `${c}.ilike.*${term}*`))
    .join(",");
  console.log(`or() 条件数: ${built.terms.length}語 × ${SEARCH_TEXT_COLUMNS.length}カラム = ${built.terms.length * SEARCH_TEXT_COLUMNS.length}`);

  const selectCols = `id, title_ja, title_en, ${SEARCH_TEXT_COLUMNS.join(", ")}, status, deadline`;
  const ilikeQuery = supabase
    .from("listings")
    .select(selectCols, { count: "exact" })
    .eq("status", "published")
    .gte("deadline", todayUtc());
  if (orClause) ilikeQuery.or(orClause);

  const { data: rows, count, error } = await ilikeQuery
    .order("deadline", { ascending: true })
    .range(0, 9);

  if (error) {
    console.log(`❌ ILIKE クエリ失敗: ${error.message}`);
    console.log("   （FTSランク/コサイン距離/RRFスコアはこの経路には存在しません）");
  } else {
    console.log(`ヒット総数(count): ${count ?? 0} 件（上位10件を表示）`);
    if (!rows || rows.length === 0) {
      console.log("（0件）");
    }
    for (const r of (rows ?? []) as unknown as Row[]) {
      console.log(
        `- id=${r.id}\n    title_ja=${JSON.stringify(r.title_ja)}\n    title_en=${JSON.stringify(r.title_en)}\n    matched=${JSON.stringify(matchedColumns(r, built.terms))}`
      );
    }
    console.log(
      "\n注: この経路にFTSランク/コサイン距離/RRFスコアは無い。並び順は deadline 昇順、ヒット判定は ILIKE 部分一致のみ。"
    );
  }

  // ---- 段4: 「閾値なしのベクトル近傍」相当 = データ実在プローブ ----------------------
  section(4, "データ実在プローブ（閾値なし近傍の代替）：各検索語が単独で何件当たるか");
  console.log(
    "ILIKE には距離の足切りが無いため、代わりに『各語がDBに実在するか』を個別に確認する。\n" +
      "どの語も0件なら“検索ロジック”ではなく“データ側に該当求人が無い/表記が違う”ことを示す。"
  );
  // 語ごとの単独ヒット件数
  const probeTerms = Array.from(new Set([...built.terms, "ポスドク", "postdoc"]));
  for (const term of probeTerms) {
    const clause = SEARCH_TEXT_COLUMNS.map((c) => `${c}.ilike.*${sanitizeForOr(term)}*`).join(",");
    const { count: c, error: e } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("deadline", todayUtc())
      .or(clause);
    console.log(`  "${term}": ${e ? `エラー(${e.message})` : `${c ?? 0} 件`}`);
  }

  // ---- 段5: searchListings が通る経路 -------------------------------------------
  section(5, "searchListings の経路判定");
  console.log(
    "このリポジトリの searchListings には RPC/ベクトル経路が無く、常に ILIKE 経路を通ります。"
  );
  console.log(
    "実アプリでの確認: DEBUG_SEARCH=1 を付けて実行すると searchListings が次の行を出力します:"
  );
  console.log(
    `  [searchListings] path=ILIKE keyword=${JSON.stringify(query)} terms=${JSON.stringify(built.terms)} orConditions=${built.terms.length * SEARCH_TEXT_COLUMNS.length}`
  );

  console.log("\n完了。\n");
}

main().catch((e) => {
  console.error("想定外エラー:", e);
  process.exit(1);
});
