import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCountryName } from "@/lib/countries";
import { localizedTitle } from "@/lib/localize";
import { getPrefectureLabel } from "@/lib/prefectures";
import type { Locale } from "@/lib/filters";
import type { PublicListing } from "@/lib/types";

const SOON_MS = 7 * 24 * 60 * 60 * 1000;

export function formatLocation(locale: Locale, listing: PublicListing): string {
  if (listing.country === "JP" && listing.prefecture) {
    return `${getCountryName(locale, "JP")} / ${getPrefectureLabel(locale, listing.prefecture)}`;
  }
  return getCountryName(locale, listing.country);
}

export default function ListingCard({ listing }: { listing: PublicListing }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const deadline = new Date(`${listing.deadline}T00:00:00`);
  const isSoon = deadline.getTime() - Date.now() <= SOON_MS;

  return (
    <li>
      <Link
        href={`/jobs/${listing.id}`}
        className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-primary/40 hover:shadow-sm"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-gray-300 bg-white px-2 py-0.5 font-medium text-gray-600">
            {t(`languageNames.${listing.post_language}`)}
          </span>
          <span className="rounded bg-brand-tab px-2 py-0.5">
            {t(`filters.field.${listing.field}`)}
          </span>
          <span className="rounded bg-brand-tab px-2 py-0.5">
            {t(`filters.jobType.${listing.job_type}`)}
          </span>
          <span className="rounded bg-brand-tab px-2 py-0.5">
            {t(`filters.employmentType.${listing.employment_type}`)}
          </span>
          {isSoon && (
            <span className="rounded bg-brand-accent px-2 py-0.5 font-bold text-white">
              {t("listing.deadlineSoon")}
            </span>
          )}
        </div>
        <h3 className="mb-1 font-bold text-brand-primary">{localizedTitle(listing, locale)}</h3>
        <p className="text-sm text-gray-700">
          {formatLocation(locale, listing)}
          {" ・ "}
          {t("listing.deadlineLabel")}:{" "}
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(deadline)}
        </p>
      </Link>
    </li>
  );
}
