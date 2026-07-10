/**
 * 研究分野マスターの seed 投入（冪等・1回実行でも再実行でもOK）
 *
 *   npx tsx scripts/seed-research-fields.ts
 *   npx tsx scripts/seed-research-fields.ts --dry-run   # 件数だけ表示
 *
 * 入力（列名は各テーブルのカラム名と一致している前提）:
 *   data/research-fields/seed_categories.csv → research_categories
 *   data/research-fields/seed_fields.csv     → research_fields
 *
 * categories → fields の順で upsert（FK 依存のため）。
 * 認証情報は .env.local から読む（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const DATA_DIR = "data/research-fields";

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    /* 環境変数が既にあれば無くてよい */
  }
}

// RFC4180 相当の最小 CSV パーサ（ダブルクォート・カンマ・改行を含む値に対応）
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const s = text.replace(/^﻿/, ""); // BOM除去

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      // 末尾や空行は捨てる
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

function readCsv(file: string): Record<string, string>[] {
  const path = resolve(process.cwd(), DATA_DIR, file);
  return parseCsv(readFileSync(path, "utf8"));
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NG: .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です。");
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const categories = readCsv("seed_categories.csv").map((r) => ({
    id: r.id,
    sort_order: Number(r.sort_order),
    name_ja: r.name_ja,
    name_en: r.name_en,
    name_zh: r.name_zh,
    name_ko: r.name_ko,
  }));
  const fields = readCsv("seed_fields.csv").map((r) => ({
    id: r.id,
    category_id: r.category_id,
    sort_order: Number(r.sort_order),
    name_ja: r.name_ja,
    name_en: r.name_en,
    name_zh: r.name_zh,
    name_ko: r.name_ko,
  }));

  console.log(`大分類: ${categories.length} 件 / 細目: ${fields.length} 件`);
  if (DRY_RUN) {
    console.log("dry-run のため投入しません。先頭サンプル:");
    console.log("  category:", JSON.stringify(categories[0]));
    console.log("  field   :", JSON.stringify(fields[0]));
    return;
  }

  // categories を先に（FK 依存のため）。upsert = 冪等。
  const BATCH = 500;
  for (let i = 0; i < categories.length; i += BATCH) {
    const { error } = await supabase
      .from("research_categories")
      .upsert(categories.slice(i, i + BATCH), { onConflict: "id" });
    if (error) {
      console.error("NG: research_categories 投入失敗:", error.message);
      process.exit(1);
    }
  }
  console.log(`✓ research_categories upsert 完了（${categories.length} 件）`);

  for (let i = 0; i < fields.length; i += BATCH) {
    const { error } = await supabase
      .from("research_fields")
      .upsert(fields.slice(i, i + BATCH), { onConflict: "id" });
    if (error) {
      console.error("NG: research_fields 投入失敗:", error.message);
      process.exit(1);
    }
  }
  console.log(`✓ research_fields upsert 完了（${fields.length} 件）`);
  console.log("完了。");
}

main().catch((e) => {
  console.error("想定外エラー:", e);
  process.exit(1);
});
