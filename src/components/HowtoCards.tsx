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
  {
    href: string;
    ctaKey: string;
    icon: ReactNode;
    iconTile: string;
    numberBg: string;
    button: string;
  }
> = {
  seek: {
    href: "/jobs",
    ctaKey: "nav.findJobs",
    icon: SearchIcon,
    iconTile: "bg-brand-tab text-brand-primary",
    numberBg: "bg-brand-primary text-white",
    button: "bg-brand-primary text-white hover:brightness-90",
  },
  post: {
    href: "/post",
    ctaKey: "nav.postJob",
    icon: MegaphoneIcon,
    iconTile: "bg-brand-green/15 text-brand-green",
    numberBg: "bg-brand-green text-white",
    button: "bg-brand-green text-white hover:brightness-95",
  },
};

function HowtoPanel({ side }: { side: Side }) {
  const t = useTranslations();
  const cfg = SIDE_CONFIG[side];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
      {/* 見出し（左上にアイコン＋タイトル） */}
      <div className="flex items-center gap-3 px-8 pt-7 pb-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.iconTile}`}
        >
          {cfg.icon}
        </span>
        <h3 className="text-lg font-bold tracking-wide text-brand-primary">
          {t(`lp.howto.${side}Title`)}
        </h3>
      </div>

      {/* ステップ＋カード内ボタン */}
      <div className="flex flex-1 flex-col px-8 pb-8 pt-3">
        <ol>
          {([1, 2, 3] as const).map((n) => (
            <li key={n}>
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cfg.numberBg}`}
                >
                  {n}
                </span>
                <span className="text-sm leading-relaxed font-medium text-gray-700 sm:text-base">
                  {t(`lp.howto.${side}S${n}`)}
                </span>
              </div>
              {n < 3 && (
                <div
                  aria-hidden="true"
                  className="my-1 ml-4 h-6 border-l border-gray-300"
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
