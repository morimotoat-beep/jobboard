"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Reveal from "./Reveal";

const SIDES = ["seek", "post"] as const;
type Side = (typeof SIDES)[number];

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// 検索（虫めがね）／拡声器（announcement）アイコン
const SearchIcon = (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const MegaphoneIcon = (
  <svg {...iconProps}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

// カードごとの設定。カードは両方ネイビー塗りで統一し、
// CTAだけ配色を分ける（探す＝白地×ネイビー文字／載せる＝キーカラー緑）。
const SIDE_CONFIG: Record<
  Side,
  { href: string; ctaKey: string; button: string; icon: ReactNode }
> = {
  seek: {
    href: "/jobs",
    ctaKey: "nav.findJobs",
    button: "bg-white text-brand-primary hover:bg-brand-tab",
    icon: SearchIcon,
  },
  post: {
    href: "/post",
    ctaKey: "nav.postJob",
    button: "bg-brand-green text-white hover:brightness-95",
    icon: MegaphoneIcon,
  },
};

function HowtoPanel({ side }: { side: Side }) {
  const t = useTranslations();
  const cfg = SIDE_CONFIG[side];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-brand-primary shadow-sm">
      {/* 塗りつぶし×円の模様（カード全面ネイビー） */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/[0.06]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-24 left-8 h-10 w-10 rounded-full bg-white/[0.05]"
      />

      {/* 見出し（左上にアイコン＋タイトル） */}
      <div className="relative flex items-center gap-3 px-8 pt-7 pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
          {cfg.icon}
        </span>
        <h3 className="text-lg font-bold tracking-wide text-white">
          {t(`lp.howto.${side}Title`)}
        </h3>
      </div>

      {/* ステップ＋カード内ボタン */}
      <div className="relative flex flex-1 flex-col px-8 pb-8 pt-3">
        <ol>
          {([1, 2, 3] as const).map((n) => (
            <li key={n}>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-primary">
                  {n}
                </span>
                <span className="text-sm leading-relaxed font-medium text-white sm:text-base">
                  {t(`lp.howto.${side}S${n}`)}
                </span>
              </div>
              {n < 3 && (
                <div
                  aria-hidden="true"
                  className="my-1 ml-4 h-6 border-l border-white/30"
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-8">
          <Link
            href={cfg.href}
            className={`block rounded-md px-6 py-3 text-center text-sm font-bold shadow-sm transition ${cfg.button}`}
          >
            {t(cfg.ctaKey)} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HowtoCards() {
  const t = useTranslations();
  const [tab, setTab] = useState<Side>("seek");

  return (
    <>
      {/* PC・タブレット：2カラム */}
      <div className="hidden gap-6 md:grid md:grid-cols-2">
        {SIDES.map((side, i) => (
          <Reveal key={side} delay={i * 150} className="h-full">
            <HowtoPanel side={side} />
          </Reveal>
        ))}
      </div>

      {/* スマホ：タブ切替 */}
      <div className="md:hidden">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {SIDES.map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => setTab(side)}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                tab === side
                  ? "bg-brand-primary text-white shadow"
                  : "text-brand-primary"
              }`}
            >
              {t(`lp.howto.${side}Title`)}
            </button>
          ))}
        </div>
        <HowtoPanel side={tab} />
      </div>
    </>
  );
}
