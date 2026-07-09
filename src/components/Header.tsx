import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-lg font-bold tracking-tight text-brand-primary">
          {t("common.siteTitle")}
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link
            href="/jobs"
            className="mr-1 rounded px-2 py-1 text-sm text-gray-700 transition hover:text-brand-primary"
          >
            {t("nav.findJobs")}
          </Link>
          <Link
            href="/links"
            className="mr-1 rounded px-2 py-1 text-sm text-gray-700 transition hover:text-brand-primary"
          >
            {t("nav.links")}
          </Link>
          <Link
            href="/post"
            className="mr-2 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            {t("nav.postJob")}
          </Link>
          {routing.locales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className={`rounded px-2 py-1 text-xs transition ${
                l === locale
                  ? "bg-brand-primary font-bold text-white"
                  : "text-gray-500 hover:text-brand-primary"
              }`}
            >
              {t(`languageNames.${l}`)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
