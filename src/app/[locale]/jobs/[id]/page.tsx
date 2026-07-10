import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RegionMap from "@/components/RegionMap";
import ReportButton from "@/components/ReportButton";
import { formatLocation } from "@/components/ListingCard";
import { Link } from "@/i18n/navigation";
import { getPublishedListing } from "@/lib/listings";
import {
  isMachineTranslated,
  localizedSummary,
  localizedTitle,
} from "@/lib/localize";
import type { Locale } from "@/lib/filters";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const listing = await getPublishedListing(id);
  if (!listing) {
    notFound();
  }

  const t = await getTranslations();
  const loc = locale as Locale;
  const deadline = new Date(`${listing.deadline}T00:00:00`);
  const dateFormat = new Intl.DateTimeFormat(loc, { dateStyle: "medium" });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Link href="/" className="mb-4 inline-block text-sm text-gray-600 underline">
          ← {t("listing.back")}
        </Link>

        <article className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-brand-card px-2 py-0.5 font-medium">
              {t(`languageNames.${listing.post_language}`)}
            </span>
            <span className="rounded bg-brand-tab px-2 py-0.5">
              {t(`filters.jobType.${listing.job_type}`)}
            </span>
            <span className="rounded bg-brand-tab px-2 py-0.5">
              {t(`filters.employmentType.${listing.employment_type}`)}
            </span>
            <span className="rounded bg-brand-tab px-2 py-0.5">
              {t(`filters.organizationType.${listing.organization_type}`)}
            </span>
          </div>

          <h2 className="mb-2 text-2xl font-bold">
            {localizedTitle(listing, loc)}
          </h2>

          {isMachineTranslated(listing, loc) && (
            <p className="mb-4 text-xs text-gray-500">
              {t("listing.machineTranslated", {
                lang: t(`languageNames.${listing.post_language}`),
              })}
            </p>
          )}

          <dl className="mb-6 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">
                {t("listing.locationLabel")}:
              </dt>
              <dd>{formatLocation(loc, listing)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">
                {t("listing.deadlineLabel")}:
              </dt>
              <dd className="font-bold text-brand-accent">
                {dateFormat.format(deadline)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">
                {t("listing.postedOn")}:
              </dt>
              <dd>{dateFormat.format(new Date(listing.created_at))}</dd>
            </div>
          </dl>

          <div className="mb-6 max-w-md overflow-hidden rounded-lg border border-gray-200">
            <RegionMap
              country={listing.country}
              prefecture={listing.prefecture}
              className="block h-auto w-full"
            />
          </div>

          <p className="mb-8 text-sm leading-relaxed whitespace-pre-wrap">
            {localizedSummary(listing, loc)}
          </p>

          <a
            href={listing.external_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block rounded-lg bg-brand-primary px-6 py-3 text-center font-bold text-white hover:brightness-105"
          >
            {t("listing.apply")}
          </a>
          <p className="mt-3 text-center text-xs text-gray-500">
            {t("listing.externalNote")}
          </p>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
            <ReportButton listingId={listing.id} />
          </div>
        </article>
      </main>
    </div>
  );
}
