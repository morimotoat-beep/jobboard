import type { Locale } from "./filters";

// 47都道府県。DBの prefecture カラムには code（ローマ字スラッグ）を保存する。
// 中国語・韓国語ラベルは翻訳QAフローで確認予定（指示書§9の注記参照）。
export type Prefecture = { code: string; labels: Record<Locale, string> };

export const PREFECTURES: Prefecture[] = [
  { code: "hokkaido", labels: { ja: "北海道", en: "Hokkaido", zh: "北海道", ko: "홋카이도" } },
  { code: "aomori", labels: { ja: "青森県", en: "Aomori", zh: "青森县", ko: "아오모리현" } },
  { code: "iwate", labels: { ja: "岩手県", en: "Iwate", zh: "岩手县", ko: "이와테현" } },
  { code: "miyagi", labels: { ja: "宮城県", en: "Miyagi", zh: "宫城县", ko: "미야기현" } },
  { code: "akita", labels: { ja: "秋田県", en: "Akita", zh: "秋田县", ko: "아키타현" } },
  { code: "yamagata", labels: { ja: "山形県", en: "Yamagata", zh: "山形县", ko: "야마가타현" } },
  { code: "fukushima", labels: { ja: "福島県", en: "Fukushima", zh: "福岛县", ko: "후쿠시마현" } },
  { code: "ibaraki", labels: { ja: "茨城県", en: "Ibaraki", zh: "茨城县", ko: "이바라키현" } },
  { code: "tochigi", labels: { ja: "栃木県", en: "Tochigi", zh: "栃木县", ko: "도치기현" } },
  { code: "gunma", labels: { ja: "群馬県", en: "Gunma", zh: "群马县", ko: "군마현" } },
  { code: "saitama", labels: { ja: "埼玉県", en: "Saitama", zh: "埼玉县", ko: "사이타마현" } },
  { code: "chiba", labels: { ja: "千葉県", en: "Chiba", zh: "千叶县", ko: "지바현" } },
  { code: "tokyo", labels: { ja: "東京都", en: "Tokyo", zh: "东京都", ko: "도쿄도" } },
  { code: "kanagawa", labels: { ja: "神奈川県", en: "Kanagawa", zh: "神奈川县", ko: "가나가와현" } },
  { code: "niigata", labels: { ja: "新潟県", en: "Niigata", zh: "新潟县", ko: "니가타현" } },
  { code: "toyama", labels: { ja: "富山県", en: "Toyama", zh: "富山县", ko: "도야마현" } },
  { code: "ishikawa", labels: { ja: "石川県", en: "Ishikawa", zh: "石川县", ko: "이시카와현" } },
  { code: "fukui", labels: { ja: "福井県", en: "Fukui", zh: "福井县", ko: "후쿠이현" } },
  { code: "yamanashi", labels: { ja: "山梨県", en: "Yamanashi", zh: "山梨县", ko: "야마나시현" } },
  { code: "nagano", labels: { ja: "長野県", en: "Nagano", zh: "长野县", ko: "나가노현" } },
  { code: "gifu", labels: { ja: "岐阜県", en: "Gifu", zh: "岐阜县", ko: "기후현" } },
  { code: "shizuoka", labels: { ja: "静岡県", en: "Shizuoka", zh: "静冈县", ko: "시즈오카현" } },
  { code: "aichi", labels: { ja: "愛知県", en: "Aichi", zh: "爱知县", ko: "아이치현" } },
  { code: "mie", labels: { ja: "三重県", en: "Mie", zh: "三重县", ko: "미에현" } },
  { code: "shiga", labels: { ja: "滋賀県", en: "Shiga", zh: "滋贺县", ko: "시가현" } },
  { code: "kyoto", labels: { ja: "京都府", en: "Kyoto", zh: "京都府", ko: "교토부" } },
  { code: "osaka", labels: { ja: "大阪府", en: "Osaka", zh: "大阪府", ko: "오사카부" } },
  { code: "hyogo", labels: { ja: "兵庫県", en: "Hyogo", zh: "兵库县", ko: "효고현" } },
  { code: "nara", labels: { ja: "奈良県", en: "Nara", zh: "奈良县", ko: "나라현" } },
  { code: "wakayama", labels: { ja: "和歌山県", en: "Wakayama", zh: "和歌山县", ko: "와카야마현" } },
  { code: "tottori", labels: { ja: "鳥取県", en: "Tottori", zh: "鸟取县", ko: "돗토리현" } },
  { code: "shimane", labels: { ja: "島根県", en: "Shimane", zh: "岛根县", ko: "시마네현" } },
  { code: "okayama", labels: { ja: "岡山県", en: "Okayama", zh: "冈山县", ko: "오카야마현" } },
  { code: "hiroshima", labels: { ja: "広島県", en: "Hiroshima", zh: "广岛县", ko: "히로시마현" } },
  { code: "yamaguchi", labels: { ja: "山口県", en: "Yamaguchi", zh: "山口县", ko: "야마구치현" } },
  { code: "tokushima", labels: { ja: "徳島県", en: "Tokushima", zh: "德岛县", ko: "도쿠시마현" } },
  { code: "kagawa", labels: { ja: "香川県", en: "Kagawa", zh: "香川县", ko: "가가와현" } },
  { code: "ehime", labels: { ja: "愛媛県", en: "Ehime", zh: "爱媛县", ko: "에히메현" } },
  { code: "kochi", labels: { ja: "高知県", en: "Kochi", zh: "高知县", ko: "고치현" } },
  { code: "fukuoka", labels: { ja: "福岡県", en: "Fukuoka", zh: "福冈县", ko: "후쿠오카현" } },
  { code: "saga", labels: { ja: "佐賀県", en: "Saga", zh: "佐贺县", ko: "사가현" } },
  { code: "nagasaki", labels: { ja: "長崎県", en: "Nagasaki", zh: "长崎县", ko: "나가사키현" } },
  { code: "kumamoto", labels: { ja: "熊本県", en: "Kumamoto", zh: "熊本县", ko: "구마모토현" } },
  { code: "oita", labels: { ja: "大分県", en: "Oita", zh: "大分县", ko: "오이타현" } },
  { code: "miyazaki", labels: { ja: "宮崎県", en: "Miyazaki", zh: "宫崎县", ko: "미야자키현" } },
  { code: "kagoshima", labels: { ja: "鹿児島県", en: "Kagoshima", zh: "鹿儿岛县", ko: "가고시마현" } },
  { code: "okinawa", labels: { ja: "沖縄県", en: "Okinawa", zh: "冲绳县", ko: "오키나와현" } },
];

export const PREFECTURE_CODES = PREFECTURES.map((p) => p.code);

export function getPrefectureLabel(locale: Locale, code: string): string {
  return PREFECTURES.find((p) => p.code === code)?.labels[locale] ?? code;
}
