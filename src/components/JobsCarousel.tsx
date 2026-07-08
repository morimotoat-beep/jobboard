"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCountryName } from "@/lib/countries";
import { getPrefectureLabel } from "@/lib/prefectures";
import { localizedTitle } from "@/lib/localize";
import type { FieldCode, Locale } from "@/lib/filters";
import type { PublicListing } from "@/lib/types";
import {
  BuildingIcon,
  FlaskIcon,
  GlobeIcon,
  MicroscopeIcon,
  PaperIcon,
  SparkleIcon,
  TestTubeIcon,
} from "./illustrations";

type IconComponent = (props: { className?: string }) => React.ReactElement;

// 分野ごとのビジュアル（カード上部の色＋アイコン）
const FIELD_VISUAL: Record<FieldCode, { bg: string; Icon: IconComponent }> = {
  field_math: { bg: "#eef6d6", Icon: PaperIcon },
  field_physics: { bg: "#deeaea", Icon: TestTubeIcon },
  field_chemistry: { bg: "#c9e265", Icon: FlaskIcon },
  field_biology: { bg: "#eef6d6", Icon: MicroscopeIcon },
  field_earth: { bg: "#deeaea", Icon: GlobeIcon },
  field_medicine: { bg: "#eef6d6", Icon: MicroscopeIcon },
  field_pharmacy: { bg: "#c9e265", Icon: FlaskIcon },
  field_agriculture: { bg: "#eef6d6", Icon: SparkleIcon },
  field_engineering: { bg: "#deeaea", Icon: BuildingIcon },
  field_informatics: { bg: "#c9e265", Icon: PaperIcon },
  field_environment: { bg: "#eef6d6", Icon: GlobeIcon },
  field_interdisciplinary: { bg: "#deeaea", Icon: SparkleIcon },
};

const SOON_MS = 7 * 24 * 60 * 60 * 1000;

function JobCard({ listing }: { listing: PublicListing }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const visual = FIELD_VISUAL[listing.field];
  const Icon = visual.Icon;
  const deadline = new Date(`${listing.deadline}T00:00:00`);
  const isSoon = deadline.getTime() - Date.now() <= SOON_MS;
  const location =
    listing.country === "JP" && listing.prefecture
      ? `${getCountryName(locale, "JP")} / ${getPrefectureLabel(locale, listing.prefecture)}`
      : getCountryName(locale, listing.country);

  return (
    <li className="w-64 shrink-0 snap-start">
      <Link
        href={`/jobs/${listing.id}`}
        className="block h-full overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg"
      >
        <div
          className="relative flex h-28 flex-col items-center justify-center gap-1"
          style={{ backgroundColor: visual.bg }}
        >
          <Icon className="w-12" />
          <span className="text-xs font-bold">
            {t(`filters.field.${listing.field}`)}
          </span>
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

export default function JobsCarousel({ listings }: { listings: PublicListing[] }) {
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
          <JobCard key={listing.id} listing={listing} />
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
