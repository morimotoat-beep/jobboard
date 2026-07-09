/**
 * 中韓求人の英訳バックフィル（1回実行用）
 *
 * title_en が null の zh / ko 求人を全件取得し、DeepL で英訳して
 * title_en / summary_en を UPDATE する。
 *
 * 実行:
 *   npx tsx scripts/backfill-en-translations.ts            # 本実行
 *   npx tsx scripts/backfill-en-translations.ts --dry-run  # 翻訳せず対象件数だけ表示
 *
 * 認証情報は .env.local から読む（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY /
 * DEEPL_API_KEY）。キーの値は表示しない。
 *
 * レート制限に配慮し 5 件ずつ・バッチ間 500ms 待機。翻訳失敗行はスキップして続行する。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BATCH_SIZE = 5;
const BATCH_WAIT_MS = 500;
const DRY_RUN = process.argv.includes("--dry-run");

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
    // .env.local が無くても環境変数が入っていれば動く
  }
}

// translate.ts の translateTexts を鏡写し（zh/ko → EN-US、1回リトライ）。
// server-only 依存を避けるため本ファイル内に再実装する。
const DEEPL_SOURCE: Record<"zh" | "ko", string> = { zh: "ZH", ko: "KO" };

async function callDeepl(
  texts: string[],
  source: "zh" | "ko"
): Promise<string[] | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return null;
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
        source_lang: DEEPL_SOURCE[source],
        target_lang: "EN-US",
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("  DeepL API error:", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const json = (await res.json()) as { translations: { text: string }[] };
    if (json.translations.length !== texts.length) return null;
    return json.translations.map((t) => t.text);
  } catch (e) {
    console.error("  DeepL API error:", String(e));
    return null;
  }
}

async function translateToEn(
  texts: string[],
  source: "zh" | "ko"
): Promise<string[] | null> {
  const first = await callDeepl(texts, source);
  if (first) return first;
  return callDeepl(texts, source); // 一時的失敗に1回だけリトライ
}

type TargetRow = {
  id: string;
  title: string;
  summary: string;
  post_language: "zh" | "ko";
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "NG: .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です。"
    );
    process.exit(1);
  }
  if (!DRY_RUN && !process.env.DEEPL_API_KEY) {
    console.error("NG: DEEPL_API_KEY が未設定です（--dry-run なら不要）。");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // title_en が未生成の zh/ko 求人を全件取得
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, summary, post_language")
    .in("post_language", ["zh", "ko"])
    .is("title_en", null);

  if (error) {
    console.error("NG: 対象求人の取得に失敗:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as TargetRow[];
  console.log(`対象: title_en が null の zh/ko 求人 ${rows.length} 件`);
  if (DRY_RUN) {
    for (const r of rows) {
      console.log(`  [dry-run] ${r.post_language} id=${r.id} title=${JSON.stringify(r.title.slice(0, 40))}`);
    }
    console.log("dry-run のため翻訳・更新は行いませんでした。");
    return;
  }
  if (rows.length === 0) {
    console.log("バックフィル対象はありません。");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    console.log(
      `\nバッチ ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}（${batch.length} 件）`
    );

    for (const row of batch) {
      const translated = await translateToEn(
        [row.title, row.summary],
        row.post_language
      );
      if (!translated) {
        console.log(`  ⏭ スキップ（翻訳失敗）: id=${row.id}`);
        skipped++;
        continue;
      }
      const { error: upErr } = await supabase
        .from("listings")
        .update({ title_en: translated[0], summary_en: translated[1] })
        .eq("id", row.id);
      if (upErr) {
        console.log(`  ⏭ スキップ（更新失敗 ${upErr.message}）: id=${row.id}`);
        skipped++;
        continue;
      }
      console.log(`  ✓ 更新: id=${row.id} → ${JSON.stringify(translated[0].slice(0, 40))}`);
      updated++;
    }

    if (i + BATCH_SIZE < rows.length) await sleep(BATCH_WAIT_MS);
  }

  console.log(`\n完了: 更新 ${updated} 件 / スキップ ${skipped} 件`);
}

main().catch((e) => {
  console.error("想定外エラー:", e);
  process.exit(1);
});
