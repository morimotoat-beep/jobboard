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

export function getCountryName(locale: Locale, code: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
