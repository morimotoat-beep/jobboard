import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { Link } from "@/i18n/navigation";
import { getListingByToken } from "@/lib/listings";
import {
  deleteListingAction,
  publishListingAction,
  updateListingAction,
} from "@/app/[locale]/post/actions";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const listing = await getListingByToken(token);
  if (!listing) {
    notFound();
  }

  const t = await getTranslations();
  const updateWithToken = updateListingAction.bind(null, token);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h2 className="mb-4 text-2xl font-bold">{t("manage.title")}</h2>

        {sp.published === "1" && (
          <div className="mb-4 rounded-lg bg-brand-card p-4 text-sm font-bold">
            {t("manage.publishedBanner")}
          </div>
        )}

        {sp.error === "1" && (
          <div className="mb-4 rounded-lg border border-brand-accent bg-white p-4 text-sm font-bold text-brand-accent">
            {t("manage.errorBanner")}
          </div>
        )}

        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm">
            <span className="font-medium text-gray-500">{t("manage.status")}: </span>
            <span className="font-bold">
              {t(`manage.statusLabels.${listing.status}`)}
            </span>
          </p>
          {listing.status === "published" && (
            <p className="mt-2 text-sm">
              <Link href={`/jobs/${listing.id}`} className="underline">
                {t("manage.viewPublic")}
              </Link>
            </p>
          )}
          {listing.status === "draft" && (
            <form action={publishListingAction} className="mt-3">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-primary px-6 py-3 font-bold text-white hover:brightness-105"
              >
                {t("manage.publish")}
              </button>
            </form>
          )}
        </div>

        <section className="mb-8">
          <h3 className="mb-3 text-lg font-bold">{t("manage.editTitle")}</h3>
          <PostForm
            mode="edit"
            action={updateWithToken}
            initial={{
              title: listing.title,
              summary: listing.summary,
              field: listing.field,
              job_type: listing.job_type,
              employment_type: listing.employment_type,
              organization_type: listing.organization_type,
              country: listing.country,
              prefecture: listing.prefecture,
              deadline: listing.deadline,
              external_url: listing.external_url,
              post_language: listing.post_language,
              poster_email: listing.poster_email,
            }}
          />
        </section>

        <details className="rounded-lg bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-bold text-brand-accent">
            {t("manage.deleteTitle")}
          </summary>
          <p className="mt-3 text-sm text-gray-600">{t("manage.deleteWarning")}</p>
          <form action={deleteListingAction} className="mt-3">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-lg bg-brand-accent px-6 py-2 font-bold text-white hover:brightness-105"
            >
              {t("manage.deleteConfirm")}
            </button>
          </form>
        </details>
      </main>
    </div>
  );
}
