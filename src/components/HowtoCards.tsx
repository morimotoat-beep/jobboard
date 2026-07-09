"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";

const SIDES = ["seek", "post"] as const;
type Side = (typeof SIDES)[number];

function HowtoPanel({ side }: { side: Side }) {
  const t = useTranslations();

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* 上部アクセントバー */}
      <span className="absolute inset-x-0 top-0 h-1 bg-brand-point" />
      <h3 className="mb-8 text-center text-lg font-bold text-brand-primary">
        {t(`lp.howto.${side}Title`)}
      </h3>
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
          <Reveal key={side} delay={i * 150}>
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
