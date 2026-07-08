import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import FilterForm, { type FilterValues } from "@/components/FilterForm";
import ListingCard from "@/components/ListingCard";
import { Link } from "@/i18n/navigation";
import { PAGE_SIZE, searchListings } from "@/lib/listings";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations();

  const values: FilterValues = {
    field: first(sp.field),
    jobType: first(sp.job),
    employmentType: first(sp.emp),
    country: first(sp.country),
    prefecture: first(sp.pref),
    within: first(sp.within),
    q: first(sp.q),
  };
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const { items, total } = await searchListings({
    field: values.field,
    jobType: values.jobType,
    employmentType: values.employmentType,
    country: values.country,
    prefecture: values.prefecture,
    deadlineWithinDays: values.within ? parseInt(values.within, 10) : undefined,
    keyword: values.q,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ページ送りリンク用に現在のフィルターを引き継ぐ
  const query: Record<string, string> = {};
  const entries: Record<string, string> = {
    field: values.field,
    job: values.jobType,
    emp: values.employmentType,
    country: values.country,
    pref: values.prefecture,
    within: values.within,
    q: values.q,
  };
  for (const [k, v] of Object.entries(entries)) {
    if (v) query[k] = v;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h2 className="mb-1 text-2xl font-bold">{t("home.title")}</h2>
        <p className="mb-4 text-sm text-gray-600">{t("common.tagline")}</p>

        <FilterForm values={values} />

        <p className="mt-6 mb-3 text-sm text-gray-600">
          {t("search.results", { count: total })}
        </p>

        {items.length === 0 ? (
          <div className="rounded-lg bg-brand-tab p-8 text-center text-gray-600">
            {t("search.empty")}
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-sm">
            {page > 1 && (
              <Link
                href={{
                  pathname: "/jobs",
                  query: { ...query, page: String(page - 1) },
                }}
                className="rounded bg-white px-3 py-1 shadow-sm"
              >
                {t("search.prev")}
              </Link>
            )}
            <span>{t("search.pageInfo", { page, totalPages })}</span>
            {page < totalPages && (
              <Link
                href={{
                  pathname: "/jobs",
                  query: { ...query, page: String(page + 1) },
                }}
                className="rounded bg-white px-3 py-1 shadow-sm"
              >
                {t("search.next")}
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
