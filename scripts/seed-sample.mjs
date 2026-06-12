// 動作確認用サンプルデータ投入スクリプト
// 投入:   node --env-file=.env.local scripts/seed-sample.mjs
// 削除:   node --env-file=.env.local scripts/seed-sample.mjs --clean
// タイトルに【サンプル】等の印を付けてあり、--clean で一括削除できる。
import { createClient } from "@supabase/supabase-js";

const MARKER = "SAMPLE-SEED";
const daysFromNow = (n) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const samples = [
  {
    title: "【サンプル】機械学習を用いた創薬研究の特任助教を募集",
    summary:
      "本研究室では、深層学習を用いた化合物スクリーニング手法の開発を行っています。博士号取得者で、PythonとPyTorchの実務経験がある方を歓迎します。\n\n※これは動作確認用のサンプル求人です。",
    field: "field_informatics",
    job_type: "job_assistant_prof",
    employment_type: "emp_fixed",
    country: "JP",
    prefecture: "tokyo",
    deadline: daysFromNow(30),
    external_url: `https://example.com/${MARKER}/1`,
    post_language: "ja",
    poster_email: "sample@example.com",
    status: "published",
  },
  {
    title: "[Sample] Postdoctoral Researcher in Quantum Materials Physics",
    summary:
      "Our group studies emergent phenomena in two-dimensional quantum materials. The successful candidate will lead low-temperature transport experiments.\n\nThis is a sample listing for testing.",
    field: "field_physics",
    job_type: "job_postdoc",
    employment_type: "emp_fixed",
    country: "US",
    prefecture: null,
    deadline: daysFromNow(60),
    external_url: `https://example.com/${MARKER}/2`,
    post_language: "en",
    poster_email: "sample@example.com",
    status: "published",
  },
  {
    title: "【サンプル】ゲノム編集技術のテニュアトラック准教授公募（締切間近）",
    summary:
      "植物ゲノム編集による品種改良研究を推進いただける准教授を公募します。\n\n※これは動作確認用のサンプル求人です。",
    field: "field_agriculture",
    job_type: "job_assoc_prof",
    employment_type: "emp_tenure_track",
    country: "JP",
    prefecture: "kyoto",
    deadline: daysFromNow(5),
    external_url: `https://example.com/${MARKER}/3`,
    post_language: "ja",
    poster_email: "sample@example.com",
    status: "published",
  },
  {
    title: "[Sample] 수리통계학 분야 조교수 채용",
    summary:
      "고차원 통계 및 인과추론 분야의 조교수를 모집합니다.\n\n테스트용 샘플 공고입니다.",
    field: "field_math",
    job_type: "job_assistant_prof",
    employment_type: "emp_permanent",
    country: "KR",
    prefecture: null,
    deadline: daysFromNow(45),
    external_url: `https://example.com/${MARKER}/4`,
    post_language: "ko",
    poster_email: "sample@example.com",
    status: "published",
  },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

if (process.argv.includes("--clean")) {
  const { error, count } = await supabase
    .from("listings")
    .delete({ count: "exact" })
    .like("external_url", `%${MARKER}%`);
  if (error) {
    console.error("NG:", error.message);
    process.exit(1);
  }
  console.log(`OK: サンプル求人を ${count} 件削除しました`);
} else {
  const { error } = await supabase.from("listings").insert(samples);
  if (error) {
    console.error("NG:", error.message);
    process.exit(1);
  }
  console.log(`OK: サンプル求人を ${samples.length} 件投入しました`);
}
