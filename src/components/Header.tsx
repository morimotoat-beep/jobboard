"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-brand-primary px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        {/* ロゴ：白い角丸下地に載せる */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
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

        {/* デスクトップ：フルナビ */}
        <nav className="hidden items-center gap-2 sm:flex">
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
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/20" />
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

        {/* モバイル：掲載ボタン＋ハンバーガー */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/post"
            className="rounded-md bg-brand-green px-3.5 py-1.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
          >
            {t("nav.postJob")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 text-white transition hover:bg-white/10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* モバイル：展開メニュー（求人を探す＋言語切り替え） */}
      {open && (
        <div className="mx-auto mt-3 max-w-5xl sm:hidden">
          <Link
            href="/jobs"
            onClick={() => setOpen(false)}
            className="mb-3 block rounded-md bg-white px-4 py-2.5 text-center text-sm font-bold text-brand-primary shadow-sm"
          >
            {t("nav.findJobs")}
          </Link>
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/20 bg-white/10 p-1">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href="/"
                locale={l}
                onClick={() => setOpen(false)}
                aria-current={l === locale ? "true" : undefined}
                className={`rounded-md py-1.5 text-center text-xs transition ${
                  l === locale
                    ? "bg-white font-bold text-brand-primary"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {t(`languageNames.${l}`)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
