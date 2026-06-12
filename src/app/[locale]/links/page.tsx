import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import { JOB_SITE_CATEGORIES } from "@/lib/jobSites";
import type { Locale } from "@/lib/filters";

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = locale as Locale;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h2 className="mb-2 text-2xl font-bold">{t("links.title")}</h2>
        <p className="mb-6 text-sm text-gray-600">{t("links.intro")}</p>

        {JOB_SITE_CATEGORIES.map((category) => (
          <section key={category.key} className="mb-8">
            <h3 className="mb-3 text-lg font-bold">
              {t(`links.categories.${category.key}`)}
            </h3>
            <ul className="space-y-3">
              {category.sites.map((site) => (
                <li key={site.url}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-white p-4 shadow-sm transition hover:bg-brand-tab"
                  >
                    <span className="font-bold underline">{site.name}</span>
                    <span className="ml-2 text-xs text-gray-400">↗</span>
                    <p className="mt-1 text-sm text-gray-600">
                      {site.desc[loc]}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs text-gray-500">{t("links.disclaimer")}</p>
      </main>
    </div>
  );
}
