import type { Locale } from "./filters";
import type { PublicListing } from "./types";

// UIの言語に対応する翻訳カラムを返す。無ければ原文（v1.1 §3）
export function localizedTitle(listing: PublicListing, locale: Locale): string {
  const titles: Record<Locale, string | null> = {
    ja: listing.title_ja,
    en: listing.title_en,
    zh: listing.title_zh,
    ko: listing.title_ko,
  };
  return titles[locale] ?? listing.title;
}

export function localizedSummary(
  listing: PublicListing,
  locale: Locale
): string {
  const summaries: Record<Locale, string | null> = {
    ja: listing.summary_ja,
    en: listing.summary_en,
    zh: listing.summary_zh,
    ko: listing.summary_ko,
  };
  return summaries[locale] ?? listing.summary;
}

// 機械翻訳を表示しているか（注記表示用）
export function isMachineTranslated(
  listing: PublicListing,
  locale: Locale
): boolean {
  return (
    locale !== listing.post_language &&
    localizedTitle(listing, locale) !== listing.title
  );
}
