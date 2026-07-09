"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";

const KEYS = ["f1", "f2", "f3", "f4"] as const;

function FeatureCard({ i }: { i: number }) {
  const t = useTranslations();
  const key = KEYS[i];
  const num = String(i + 1).padStart(2, "0");

  return (
    <div className="group relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white p-7 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl">
      {/* 大きな透かし番号 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 -right-1 text-7xl leading-none font-black text-brand-primary/[0.06] select-none"
      >
        {num}
      </span>
      {/* 番号バッジ */}
      <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-sm font-black text-brand-point">
        {num}
      </span>
      <h3 className="mb-2.5 text-base font-bold [word-break:keep-all] text-brand-primary">
        {t(`lp.features.${key}Title`)}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600">
        {t(`lp.features.${key}Body`)}
      </p>
      {/* ホバーで伸びる下線アクセント */}
      <span className="absolute bottom-0 left-0 h-1 w-0 bg-brand-point transition-all duration-300 group-hover:w-full" />
    </div>
  );
}

export default function FeatureCards() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / KEYS.length));
    setActive(Math.max(0, Math.min(KEYS.length - 1, idx)));
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / KEYS.length) * i, behavior: "smooth" });
  };

  return (
    <>
      {/* PC・タブレット：カードグリッド */}
      <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {KEYS.map((key, i) => (
          <Reveal key={key} delay={i * 100}>
            <FeatureCard i={i} />
          </Reveal>
        ))}
      </div>

      {/* スマホ：横スライダー */}
      <div className="sm:hidden">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {KEYS.map((key, i) => (
            <li key={key} className="w-[82%] shrink-0 snap-center">
              <FeatureCard i={i} />
            </li>
          ))}
        </ul>
        {/* ドットインジケーター */}
        <div className="mt-4 flex justify-center gap-2">
          {KEYS.map((key, i) => (
            <button
              key={key}
              type="button"
              aria-label={`feature ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                active === i ? "w-6 bg-brand-primary" : "w-2 bg-brand-primary/25"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
