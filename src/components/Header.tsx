import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="border-b border-white/10 bg-brand-primary px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        {/* ロゴは白い角丸の下地に載せる（ネイビー地でグレー文字が沈まないように） */}
        <Link
          href="/"
          className="flex items-center rounded-lg bg-white px-3 py-1.5 shadow-sm"
        >
          <Image
            src="/logo.png"
            alt={t("common.siteTitle")}
            width={600}
            height={135}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {/* アクションボタン群：ネイビー地でも押せると分かる明るいボタン */}
          <Link
            href="/jobs"
            className="rounded-md bg-white px-4 py-1.5 text-sm font-bold text-brand-primary shadow-sm transition hover:bg-brand-tab"
          >
            {t("nav.findJobs")}
          </Link>
          <Link
            href="/post"
            className="rounded-md bg-brand-green px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
          >
            {t("nav.postJob")}
          </Link>

          {/* 区切り線：言語切り替えと場所を分ける */}
          <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

          {/* 言語切り替え：ネイビー地に半透明の下地＋白ピルで現在地を明示 */}
          <div className="flex items-center rounded-full border border-white/20 bg-white/10 p-0.5">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href="/"
                locale={l}
                aria-current={l === locale ? "true" : undefined}
                className={`rounded-full px-2.5 py-1 text-xs transition ${
                  l === locale
                    ? "bg-white font-bold text-brand-primary shadow-sm"
                    : "text-white/70 hover:text-white"
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
