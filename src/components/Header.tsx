"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // プルダウンの外側クリックで閉じる
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [langOpen]);

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* ロゴ：囲みなしで白地に直接置く */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt={t("common.siteTitle")}
            width={600}
            height={135}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/jobs"
            prefetch
            className="rounded-md bg-brand-primary px-3.5 py-1.5 text-sm font-bold whitespace-nowrap text-white shadow-sm transition hover:brightness-90"
          >
            {t("nav.findJobs")}
          </Link>
          <Link
            href="/post"
            prefetch
            className="rounded-md bg-brand-green px-3.5 py-1.5 text-sm font-bold whitespace-nowrap text-white shadow-sm transition hover:brightness-95"
          >
            {t("nav.postJob")}
          </Link>

          {/* 言語切り替え：右上の「Language」プルダウン */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-brand-primary transition hover:bg-brand-tab"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
              </svg>
              <span className="hidden sm:inline">Language</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 z-20 mt-1.5 w-36 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {routing.locales.map((l) => (
                  <Link
                    key={l}
                    href="/"
                    locale={l}
                    onClick={() => setLangOpen(false)}
                    aria-current={l === locale ? "true" : undefined}
                    className={`block px-4 py-2 text-sm transition ${
                      l === locale
                        ? "bg-brand-tab font-bold text-brand-primary"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t(`languageNames.${l}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
