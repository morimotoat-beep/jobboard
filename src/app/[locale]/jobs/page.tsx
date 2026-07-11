import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import FilterForm, { type FilterValues } from "@/components/FilterForm";
import ListingCard from "@/components/ListingCard";
import { Link } from "@/i18n/navigation";
import { PAGE_SIZE, searchListings } from "@/lib/listings";
import { getResearchFieldTree } from "@/lib/researchFields";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

// repeated クエリ（?rf=a&rf=b）を配列で受ける
function many(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v.filter(Boolean);
  return v ? [v] : [];
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
  const fieldTree = await getResearchFieldTree();

  const values: FilterValues = {
    jobType: first(sp.job),
    employmentType: first(sp.emp),
    organizationType: first(sp.org),
    country: first(sp.country),
    prefecture: first(sp.pref),
    q: first(sp.q),
    researchFieldIds: many(sp.rf),
  };
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const { items, total } = await searchListings({
    jobType: values.jobType,
    employmentType: values.employmentType,
    organizationType: values.organizationType,
    country: values.country,
    prefecture: values.prefecture,
    keyword: values.q,
    researchFieldIds: values.researchFieldIds,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ページ送りリンク用に現在のフィルターを引き継ぐ
  const query: Record<string, string | string[]> = {};
  const entries: Record<string, string> = {
    job: values.jobType,
    emp: values.employmentType,
    org: values.organizationType,
    country: values.country,
    pref: values.prefecture,
    q: values.q,
  };
  for (const [k, v] of Object.entries(entries)) {
    if (v) query[k] = v;
  }
  if (values.researchFieldIds.length > 0) query.rf = values.researchFieldIds;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white px-4 py-12">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl">
              <span className="marker-highlight px-2">{t("home.title")}</span>
            </h2>
            <p className="text-sm text-gray-500">{t("common.tagline")}</p>
          </div>

          <FilterForm values={values} fieldTree={fieldTree} />

          <p className="mt-8 mb-3 text-sm font-medium text-gray-600">
            {t("search.results", { count: total })}
          </p>

          {items.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-brand-bg p-8 text-center">
              <p className="mb-4 text-sm text-gray-600">{t("search.empty")}</p>
              <Link
                href="/post"
                className="inline-block rounded-md border border-brand-primary bg-white px-8 py-2.5 font-bold text-brand-primary transition hover:bg-brand-tab"
              >
                {t("lp.hero.ctaPost")}
              </Link>
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
                className="rounded-md border border-gray-200 bg-white px-4 py-1.5 font-medium transition hover:bg-brand-tab"
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
                className="rounded-md border border-gray-200 bg-white px-4 py-1.5 font-medium transition hover:bg-brand-tab"
              >
                {t("search.next")}
              </Link>
            )}
          </nav>
        )}
        </div>
      </main>
    </div>
  );
}
