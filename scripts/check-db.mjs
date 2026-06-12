// DB接続確認スクリプト
// 実行: node --env-file=.env.local scripts/check-db.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "NG: 環境変数が読めません。.env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。"
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { count, error } = await supabase
  .from("listings")
  .select("id", { count: "exact" })
  .limit(1);

if (error) {
  console.error("NG:", error.message);
  console.error(
    "ヒント: 「relation \"public.listings\" does not exist」の場合は supabase/schema.sql が未実行です。"
  );
  process.exit(1);
}

console.log(`OK: listings テーブルに接続できました（現在 ${count} 件）`);
