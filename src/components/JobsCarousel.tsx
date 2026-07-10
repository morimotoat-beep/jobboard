"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCountryName } from "@/lib/countries";
import { getPrefectureLabel } from "@/lib/prefectures";
import { localizedTitle } from "@/lib/localize";
import { useDeadlineSoon } from "@/lib/useDeadlineSoon";
import type { Locale } from "@/lib/filters";
import type { PublicListing } from "@/lib/types";

// カード上部の色帯（分野別の出し分けは廃止し、中立の共通色に統一）
const CARD_BG = "#e7ecf3";

function JobCard({
  listing,
  map,
}: {
  listing: PublicListing;
  map?: React.ReactNode;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const bg = CARD_BG;
  const deadline = new Date(`${listing.deadline}T00:00:00`);
  const isSoon = useDeadlineSoon(listing.deadline);
  const location =
    listing.country === "JP" && listing.prefecture
      ? `${getCountryName(locale, "JP")} / ${getPrefectureLabel(locale, listing.prefecture)}`
      : getCountryName(locale, listing.country);

  return (
    <li className="w-64 shrink-0 snap-start">
      <Link
        href={`/jobs/${listing.id}`}
        className="block h-full overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
      >
        <div
          className="relative flex h-28 flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: bg }}
        >
          {map}
          {isSoon && (
            <span className="absolute top-2 right-2 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-white">
              {t("listing.deadlineSoon")}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 min-h-[2.7em] text-sm leading-snug font-bold">
            {localizedTitle(listing, locale)}
          </h3>
          <p className="mb-1 text-xs text-gray-600">{location}</p>
          <p
            className={`mb-3 text-xs ${
              isSoon ? "font-bold text-brand-accent" : "text-gray-600"
            }`}
          >
            {t("listing.deadlineLabel")}:{" "}
            {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(deadline)}
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="rounded border border-brand-primary/30 bg-white px-1.5 py-0.5 text-[10px] font-medium text-brand-primary">
              {t(`filters.organizationType.${listing.organization_type}`)}
            </span>
            <span className="rounded bg-brand-tab px-1.5 py-0.5 text-[10px]">
              {t(`filters.jobType.${listing.job_type}`)}
            </span>
            <span className="rounded bg-brand-tab px-1.5 py-0.5 text-[10px]">
              {t(`filters.employmentType.${listing.employment_type}`)}
            </span>
            <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px]">
              {t(`languageNames.${listing.post_language}`)}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function JobsCarousel({
  listings,
  maps,
}: {
  listings: PublicListing[];
  maps?: Record<string, React.ReactNode>;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const scrollByCards = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {listings.map((listing) => (
          <JobCard key={listing.id} listing={listing} map={maps?.[listing.id]} />
        ))}
      </ul>
      {listings.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="previous"
            className="absolute top-1/2 -left-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white font-bold text-brand-primary shadow-md transition hover:bg-brand-tab sm:flex"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="next"
            className="absolute top-1/2 -right-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white font-bold text-brand-primary shadow-md transition hover:bg-brand-tab sm:flex"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
