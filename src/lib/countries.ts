import type { Locale } from "./filters";

// 主要国の ISO 3166-1 alpha-2 コード。日本を先頭に、アジア→オセアニア→北米→欧州→その他の順。
// 国名ラベルは Intl.DisplayNames で各ロケールから自動生成する（辞書メンテ不要）。
export const COUNTRY_CODES = [
  "JP", "KR", "CN", "TW", "HK", "SG", "IN", "TH", "MY", "VN", "ID",
  "AU", "NZ",
  "US", "CA",
  "GB", "DE", "FR", "NL", "CH", "SE", "DK", "NO", "FI",
  "AT", "BE", "IE", "IT", "ES", "PT", "PL", "CZ",
  "IL", "SA", "AE", "QA",
  "BR", "MX", "ZA",
] as const;

// Intl.DisplayNames が正式名称を返す地域は、一般的な通称で上書きする
// （例: ja の HK は「中華人民共和国香港特別行政区」になってしまう）
const NAME_OVERRIDES: Partial<Record<Locale, Record<string, string>>> = {
  ja: { HK: "香港" },
  zh: { HK: "香港" },
  ko: { HK: "홍콩" },
  en: { HK: "Hong Kong" },
};

export function getCountryName(locale: Locale, code: string): string {
  const override = NAME_OVERRIDES[locale]?.[code];
  if (override) return override;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
