import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="bg-brand-primary px-4 py-3">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-lg font-bold text-white">
          {t("common.siteTitle")}
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link
            href="/links"
            className="mr-1 rounded px-2 py-1 text-sm text-white underline hover:bg-brand-card hover:text-foreground"
          >
            {t("nav.links")}
          </Link>
          <Link
            href="/post"
            className="mr-2 rounded bg-white px-3 py-1 text-sm font-bold text-brand-primary hover:brightness-95"
          >
            {t("nav.postJob")}
          </Link>
          {routing.locales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className={`rounded px-2 py-1 text-sm ${
                l === locale
                  ? "bg-white font-bold text-brand-primary"
                  : "bg-brand-tab text-gray-600"
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
