// 学術求人の頻出語について、言語・表記をまたいだ同義語グループを定義する。
// DeepL の訳語割れ（例: 韓国語「박사후연구원」→「博士研究員 / postdoctoral researcher」で
// 「ポスドク / Postdoc」に部分一致しない）を、同義語展開で吸収するための辞書。
//
// 検索語（原文・日訳・英訳）がいずれかのグループの語に一致したら、そのグループ全体を
// 検索語に加える（ILIKE 部分一致・大文字小文字無視）。

export const SEARCH_SYNONYM_GROUPS: readonly string[][] = [
  ["postdoc", "postdoctoral", "ポスドク", "博士研究員", "ポストドクター", "박사후연구원", "博士后"],
  ["professor", "教授", "교수"],
  ["associate professor", "准教授", "부교수", "副教授"],
  ["assistant professor", "助教", "조교수"],
  ["lecturer", "講師", "강사"],
  ["researcher", "research scientist", "研究員", "研究者", "연구원", "研究员"],
  ["PhD", "doctoral", "博士", "박사"],
  ["machine learning", "ML", "機械学習", "머신러닝", "机器学习"],
];

// 与えられた検索語に一致する同義語グループの、全同義語を返す。
// 一致判定は大文字小文字無視の部分一致（どちらが部分文字列でもよい）。
export function expandSynonyms(terms: Iterable<string>): string[] {
  const expanded = new Set<string>();
  // 1文字の語での誤展開（"a" が machine learning 等に部分一致）を避ける
  const lowered = [...terms]
    .map((t) => t.toLowerCase())
    .filter((t) => t.length >= 2);

  for (const group of SEARCH_SYNONYM_GROUPS) {
    const matched = group.some((word) => {
      const w = word.toLowerCase();
      return lowered.some((t) => t.includes(w) || w.includes(t));
    });
    if (matched) {
      for (const word of group) expanded.add(word);
    }
  }
  return [...expanded];
}
