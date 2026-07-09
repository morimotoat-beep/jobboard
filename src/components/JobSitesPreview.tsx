import { useLocale, useTranslations } from "next-intl";
import { JOB_SITE_CATEGORIES } from "@/lib/jobSites";
import type { Locale } from "@/lib/filters";

// 各サイトのファビコンをロゴとして使う（外部画像・キー不要）
function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return "";
  }
}

export default function JobSitesPreview() {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <div className="space-y-8">
      {JOB_SITE_CATEGORIES.map((category) => (
        <div key={category.key}>
          <h3 className="mb-3 border-l-2 border-brand-primary pl-3 text-sm font-bold text-brand-primary">
            {t(`links.categories.${category.key}`)}
          </h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.sites.map((site) => (
              <li key={site.url}>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/40 hover:shadow-sm"
                >
                  <img
                    src={faviconUrl(site.url)}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-brand-tab object-contain p-1"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-bold">
                      <span className="truncate">{site.name}</span>
                      <span className="shrink-0 text-xs text-gray-400 transition group-hover:text-brand-primary">
                        ↗
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                      {site.desc[locale]}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
