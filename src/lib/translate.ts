import "server-only";

// DeepL による自動翻訳（v1.1 §3 / v1.2 英語ピボット拡張）
// - 投稿確定時に1回だけ翻訳してDBに保存（表示のたびに翻訳しない）
// - 日⇔英に加え、中韓求人は英訳(title_en/summary_en)を生成する
//   （英語ピボットのセマンティック検索から中韓求人が漏れないようにするため）
// - DEEPL_API_KEY 未設定や翻訳失敗時は null を返し、原文表示にフォールバック

type Lang = "ja" | "en" | "zh" | "ko";

const DEEPL_SOURCE: Record<Lang, string> = {
  ja: "JA",
  en: "EN",
  zh: "ZH",
  ko: "KO",
};
const DEEPL_TARGET: Record<Lang, string> = {
  ja: "JA",
  en: "EN-US",
  zh: "ZH",
  ko: "KO",
};

async function callDeepl(
  texts: string[],
  source: Lang | null,
  target: Lang
): Promise<string[] | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return null;

  // Free プランのキーは「:fx」で終わり、エンドポイントが異なる
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
        text: texts,
        // source が null のときは source_lang を送らず DeepL に自動判定させる
        // （中国語・韓国語のクエリ翻訳を可能にするため）
        ...(source ? { source_lang: DEEPL_SOURCE[source] } : {}),
        target_lang: DEEPL_TARGET[target],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("DeepL API error:", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { translations: { text: string }[] };
    if (json.translations.length !== texts.length) return null;
    return json.translations.map((t) => t.text);
  } catch (e) {
    console.error("DeepL API error:", e);
    return null;
  }
}

export async function translateTexts(
  texts: string[],
  source: Lang,
  target: Lang
): Promise<string[] | null> {
  if (!process.env.DEEPL_API_KEY) return null;
  // 一時的な失敗（タイムアウト・5xx）に備えて1回だけリトライする
  const first = await callDeepl(texts, source, target);
  if (first) return first;
  return callDeepl(texts, source, target);
}

// 投稿・更新時に翻訳カラムの値を組み立てる。
// オリジナルは自言語のカラムにそのまま入れ、日⇔英のみ翻訳を生成する。
export async function buildListingTranslations(input: {
  title: string;
  summary: string;
  post_language: string;
}): Promise<Record<string, string>> {
  const cols: Record<string, string> = {};
  const lang = input.post_language;

  if (lang === "ja" || lang === "en" || lang === "zh" || lang === "ko") {
    cols[`title_${lang}`] = input.title;
    cols[`summary_${lang}`] = input.summary;
  }

  if (lang === "ja" || lang === "en") {
    const target: Lang = lang === "ja" ? "en" : "ja";
    const translated = await translateTexts(
      [input.title, input.summary],
      lang,
      target
    );
    if (translated) {
      cols[`title_${target}`] = translated[0];
      cols[`summary_${target}`] = translated[1];
    }
  }

  // 中韓求人は英語ピボットのセマンティック検索から漏れないよう英訳のみ生成する。
  // 日本語訳は既存方針どおり生成しない。翻訳失敗時は英訳カラムを未設定のまま返す。
  if (lang === "zh" || lang === "ko") {
    const translated = await translateTexts(
      [input.title, input.summary],
      lang,
      "en"
    );
    if (translated) {
      cols.title_en = translated[0];
      cols.summary_en = translated[1];
    }
  }

  return cols;
}

// --- 自由文検索クエリの翻訳（v1.2 §多言語検索）--------------------------------
// 検索欄に入力された語を日本語・英語に訳し、翻訳カラム横断検索の検索語に使う。
// DeepL 無料枠（月50万字）を守るため、同一クエリはキャッシュから返し再翻訳しない。

const QUERY_CACHE_MAX = 500;
const QUERY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24時間

type QueryCacheEntry = { value: string | null; expires: number };

// モジュールスコープの簡易LRUキャッシュ。Map は挿入順を保持するので、
// 参照時に delete→set し直すことで「最近使った順」を維持する。
const queryCache = new Map<string, QueryCacheEntry>();

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function queryCacheGet(key: string): QueryCacheEntry | undefined {
  const entry = queryCache.get(key);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    queryCache.delete(key);
    return undefined;
  }
  // アクセスされたエントリを最新（末尾）に移動
  queryCache.delete(key);
  queryCache.set(key, entry);
  return entry;
}

function queryCacheSet(key: string, value: string | null): void {
  queryCache.delete(key);
  queryCache.set(key, { value, expires: Date.now() + QUERY_CACHE_TTL_MS });
  // 上限超過分を古い方（先頭）から捨てる
  while (queryCache.size > QUERY_CACHE_MAX) {
    const oldest = queryCache.keys().next().value;
    if (oldest === undefined) break;
    queryCache.delete(oldest);
  }
}

// 検索クエリを target 言語に翻訳する。source は指定せず DeepL の自動判定に任せる。
// - キャッシュヒット時は DeepL を呼ばない
// - キー未設定・翻訳失敗時は null（呼び出し側は原文で検索）
export async function translateQuery(
  text: string,
  target: "ja" | "en"
): Promise<string | null> {
  const normalized = normalizeQuery(text);
  if (!normalized) return null;

  const key = `${target}:${normalized}`;
  const cached = queryCacheGet(key);
  if (cached) return cached.value;

  const translated = await callDeepl([text], null, target);
  const value = translated ? translated[0] : null;
  queryCacheSet(key, value);
  return value;
}

// 更新時に古い翻訳が残らないよう、全翻訳カラムを一旦クリアするための値
export const CLEARED_TRANSLATION_COLUMNS = {
  title_ja: null,
  title_en: null,
  title_zh: null,
  title_ko: null,
  summary_ja: null,
  summary_en: null,
  summary_zh: null,
  summary_ko: null,
} as const;
