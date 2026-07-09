import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt={t("common.siteTitle")}
            width={600}
            height={135}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {/* アクションボタン群：どちらも押せると分かるボタン形状 */}
          <Link
            href="/jobs"
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-bold text-brand-primary shadow-sm transition hover:border-brand-primary hover:bg-brand-tab"
          >
            {t("nav.findJobs")}
          </Link>
          <Link
            href="/post"
            className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            {t("nav.postJob")}
          </Link>

          {/* 区切り線：言語切り替えと場所を分ける */}
          <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

          {/* 言語切り替え：白ピル型セグメント。掲載ボタンとは別デザインで区別 */}
          <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href="/"
                locale={l}
                aria-current={l === locale ? "true" : undefined}
                className={`rounded-full px-2.5 py-1 text-xs transition ${
                  l === locale
                    ? "bg-white font-bold text-brand-primary shadow-sm"
                    : "text-gray-500 hover:text-brand-primary"
                }`}
              >
                {t(`languageNames.${l}`)}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
