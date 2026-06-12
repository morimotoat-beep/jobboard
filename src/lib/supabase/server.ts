import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// service role キーを使うクライアント。RLSをバイパスするため、
// このモジュールは絶対にクライアントコンポーネントから import しない
// （"server-only" によりビルド時にエラーで検出される）。
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase の環境変数が未設定です。.env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を確認してください。"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
