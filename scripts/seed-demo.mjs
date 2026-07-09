// デモ用求人データの投入
//   投入: node --env-file=.env.local scripts/seed-demo.mjs
//   削除: node --env-file=.env.local scripts/seed-demo.mjs --clean
// poster_email を "demo@academianote.site" で統一し、--clean で一括削除できる。
// external_url は 200 を返す https://example.com/ を使い、リンク切れ判定で消えないようにする。
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@academianote.site";
const URL_OK = "https://example.com/";
const days = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// 日英両方の翻訳を入れて「日⇔英の架け橋」を体感できるようにする
const demos = [
  {
    field: "field_informatics",
    job_type: "job_assistant_prof",
    employment_type: "emp_fixed",
    organization_type: "university",
    country: "JP",
    prefecture: "tokyo",
    deadline: days(40),
    post_language: "ja",
    title: "深層学習を用いた創薬研究 特任助教（任期付）",
    summary:
      "GPUクラスタを用いた大規模シミュレーションと機械学習で、創薬標的の探索を行う研究室です。博士号取得（見込みを含む）で、PythonおよびPyTorch等の実務経験がある方を歓迎します。国際共同研究や海外学会発表の機会も豊富です。",
    title_en: "Project Assistant Professor (Fixed-term): Drug Discovery with Deep Learning",
    summary_en:
      "Our lab explores drug-discovery targets using large-scale simulation and machine learning on a GPU cluster. We welcome applicants with a PhD (or expected) and hands-on experience in Python and PyTorch. Many opportunities for international collaboration and conferences.",
  },
  {
    field: "field_physics",
    job_type: "job_postdoc",
    employment_type: "emp_fixed",
    organization_type: "company",
    country: "US",
    prefecture: null,
    deadline: days(65),
    post_language: "en",
    title: "Postdoctoral Researcher in Quantum Materials",
    summary:
      "We study emergent phenomena in two-dimensional quantum materials. The successful candidate will lead low-temperature transport experiments and collaborate with theory groups. Experience in cryogenics and nanofabrication is a plus.",
    title_ja: "量子材料分野 ポスドク研究員の募集",
    summary_ja:
      "二次元量子材料における創発現象を研究しています。採用者は低温輸送実験を主導し、理論グループと共同研究を行います。極低温技術やナノ加工の経験があれば尚可です。",
  },
  {
    field: "field_engineering",
    job_type: "job_postdoc",
    employment_type: "emp_fixed",
    organization_type: "research_institute",
    country: "DE",
    prefecture: null,
    deadline: days(30),
    post_language: "ja",
    title: "【ドイツ・研究機関】次世代電池材料のポスドク（日本人研究者歓迎）",
    summary:
      "ミュンヘン近郊の研究機関で、全固体電池の材料開発に携わるポスドクを募集します。英語での研究環境ですが、日本の大学との共同研究実績があり、渡航・生活のサポート体制も整っています。材料工学または電気化学のバックグラウンドを歓迎します。",
    title_en:
      "[Germany] Postdoc in Next-generation Battery Materials (Japanese researchers welcome)",
    summary_en:
      "A research institute near Munich seeks a postdoc in solid-state battery materials. The working language is English, and we have a track record of joint research with Japanese universities plus relocation support. A background in materials engineering or electrochemistry is welcome.",
  },
  {
    field: "field_biology",
    job_type: "job_assistant_prof",
    employment_type: "emp_tenure_track",
    organization_type: "university",
    country: "SG",
    prefecture: null,
    deadline: days(85),
    post_language: "en",
    title: "Tenure-track Assistant Professor in Synthetic Biology",
    summary:
      "The department invites applications for a tenure-track position in synthetic biology. We seek candidates developing novel genetic circuits or cell-free systems. Generous startup funding and a vibrant international campus await.",
    title_ja: "合成生物学 テニュアトラック助教の公募",
    summary_ja:
      "合成生物学分野のテニュアトラック助教を公募します。新規の遺伝子回路や無細胞システムを開発する候補者を求めています。潤沢なスタートアップ資金と国際色豊かなキャンパスが魅力です。",
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
    .eq("poster_email", DEMO_EMAIL);
  if (error) {
    console.error("NG:", error.message);
    process.exit(1);
  }
  console.log(`OK: デモ求人を ${count} 件削除しました`);
} else {
  // 再実行時に重複しないよう、既存のデモを消してから入れ直す
  await supabase.from("listings").delete().eq("poster_email", DEMO_EMAIL);
  const rows = demos.map((d) => {
    const row = {
      ...d,
      poster_email: DEMO_EMAIL,
      external_url: URL_OK,
      status: "published",
    };
    // 投稿言語の原文カラムも埋めておく（表示のフォールバック用）
    row[`title_${d.post_language}`] = d.title;
    row[`summary_${d.post_language}`] = d.summary;
    return row;
  });
  const { error } = await supabase.from("listings").insert(rows);
  if (error) {
    console.error("NG:", error.message);
    process.exit(1);
  }
  console.log(`OK: デモ求人を ${rows.length} 件投入しました（すべて公開中）`);
}
