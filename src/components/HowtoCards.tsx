"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Reveal from "./Reveal";

const SIDES = ["seek", "post"] as const;
type Side = (typeof SIDES)[number];

// カードごとのテーマ（探す＝ネイビー／載せる＝キーカラー緑）
const SIDE_CONFIG: Record<
  Side,
  { href: string; ctaKey: string; header: string; button: string }
> = {
  seek: {
    href: "/jobs",
    ctaKey: "nav.findJobs",
    header: "bg-gradient-to-br from-brand-primary to-[#31598c]",
    button: "bg-brand-primary hover:brightness-110",
  },
  post: {
    href: "/post",
    ctaKey: "nav.postJob",
    header: "bg-gradient-to-br from-brand-green to-[#57a12a]",
    button: "bg-brand-green hover:brightness-95",
  },
};

function HowtoPanel({ side }: { side: Side }) {
  const t = useTranslations();
  const cfg = SIDE_CONFIG[side];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 塗りつぶし×グラデ×円の模様のヘッダー */}
      <div className={`relative overflow-hidden px-8 py-7 text-center ${cfg.header}`}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/[0.08]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3 left-8 h-10 w-10 rounded-full bg-white/[0.06]"
        />
        <h3 className="relative text-lg font-bold tracking-wide text-white">
          {t(`lp.howto.${side}Title`)}
        </h3>
      </div>

      {/* ステップ＋カード内ボタン */}
      <div className="flex flex-1 flex-col px-8 py-8">
        <ol>
          {([1, 2, 3] as const).map((n) => (
            <li key={n}>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                  {n}
                </span>
                <span className="text-sm leading-relaxed font-medium sm:text-base">
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
            className={`block rounded-md px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition ${cfg.button}`}
          >
            {t(cfg.ctaKey)}
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
