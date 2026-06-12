// キーの「種類」だけを判定する診断スクリプト（キー本体は出力しない）
// 実行: node --env-file=.env.local scripts/diagnose-key.mjs
function describe(name, key) {
  if (!key) {
    console.log(`${name}: 未設定`);
    return;
  }
  if (key.startsWith("sb_secret_")) {
    console.log(`${name}: 新形式の secret キー（service role 相当）`);
  } else if (key.startsWith("sb_publishable_")) {
    console.log(`${name}: 新形式の publishable キー（anon 相当）`);
  } else if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString()
      );
      console.log(`${name}: 旧形式 JWT（role = ${payload.role}）`);
    } catch {
      console.log(`${name}: JWT風だが解析不能`);
    }
  } else {
    console.log(`${name}: 不明な形式（先頭: ${key.slice(0, 3)}...）`);
  }
}

describe("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
describe("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
