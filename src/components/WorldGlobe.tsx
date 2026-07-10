"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  geoDistance,
} from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { getCountryName } from "@/lib/countries";
import type { Locale } from "@/lib/filters";

// ドラッグ/スワイプで回せる3D風の地球儀（d3-geo geoOrthographic）。
// 見た目は従来のフラット WorldMap を踏襲（白い国＋#7dc436 ハイライト＋件数バッジ）。

const SIZE = 500; // viewBox（正方形）
const CENTER = SIZE / 2;
const RADIUS = 235; // 球の半径px（余白を残す）
const INITIAL_ROTATION: [number, number] = [-138, -36]; // 日本を正面に
const PHI_CLAMP = 80;
const DRAG_THRESHOLD = 5; // これ未満の移動はクリック扱い
const AUTO_SPEED = 0.12; // 度/フレーム（自動回転）

// ISO 3166-1 alpha-2 → numeric（world-atlas の Feature id と対応）
const NUMERIC_ID: Record<string, string> = {
  JP: "392", KR: "410", CN: "156", TW: "158", HK: "344", SG: "702",
  IN: "356", TH: "764", MY: "458", VN: "704", ID: "360",
  AU: "036", NZ: "554", US: "840", CA: "124",
  GB: "826", DE: "276", FR: "250", NL: "528", CH: "756", SE: "752",
  DK: "208", NO: "578", FI: "246", AT: "040", BE: "056", IE: "372",
  IT: "380", ES: "724", PT: "620", PL: "616", CZ: "203",
  IL: "376", SA: "682", AE: "784", QA: "634",
  BR: "076", MX: "484", ZA: "710",
};

// バッジ位置・裏面判定用の代表座標 [経度, 緯度]（首都付近）
const COORDS: Record<string, [number, number]> = {
  JP: [138, 36], KR: [127, 37], CN: [105, 35], TW: [121, 24], HK: [114, 22],
  SG: [104, 1.3], IN: [78, 21], TH: [101, 15], MY: [102, 3], VN: [108, 16],
  ID: [113, -6], AU: [134, -25], NZ: [174, -41], US: [-98, 39], CA: [-106, 56],
  GB: [-2, 54], DE: [10, 51], FR: [2, 46], NL: [5, 52], CH: [8, 47],
  SE: [15, 62], DK: [10, 56], NO: [9, 61], FI: [26, 64], AT: [14, 47],
  BE: [4, 50], IE: [-8, 53], IT: [12, 42], ES: [-4, 40], PT: [-9, 39],
  PL: [19, 52], CZ: [15, 50], IL: [35, 31], SA: [45, 24], AE: [54, 24],
  QA: [51, 25], BR: [-55, -10], MX: [-102, 23], ZA: [24, -29],
};

// 地物はモジュール読み込み時に1回だけ生成（110m・南極除外）
/* eslint-disable @typescript-eslint/no-explicit-any */
const topology = worldAtlas as any;
const allFeatures = (feature(topology, topology.objects.countries) as any)
  .features as Array<{ id: unknown }>;
const LANDS = allFeatures
  .filter((f) => String(f.id) !== "010")
  .map((f, i) => ({
    id: String(f.id).padStart(3, "0"),
    uid: `${String(f.id)}-${i}`,
    feature: f as any,
  }));
const GRATICULE = geoGraticule10();
const SPHERE = { type: "Sphere" } as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function WorldGlobe({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  const [rotation, setRotation] = useState<[number, number]>(INITIAL_ROTATION);
  const rotationRef = useRef<[number, number]>(INITIAL_ROTATION);
  const autoRef = useRef(true);
  const autoRafRef = useRef<number | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movedRef = useRef(0);

  const entries = Object.entries(counts)
    .filter(([code, count]) => count > 0 && COORDS[code])
    .sort((a, b) => b[1] - a[1]);
  const highlighted = new Set(entries.map(([code]) => NUMERIC_ID[code]));

  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(RADIUS)
        .translate([CENTER, CENTER])
        .rotate(rotation)
        .clipAngle(90),
    [rotation]
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  // 自動回転：触られるまで λ を微増。prefers-reduced-motion では無効。
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (reduce) {
      autoRef.current = false;
      return;
    }
    const step = () => {
      if (!autoRef.current) {
        autoRafRef.current = null;
        return;
      }
      const [l, p] = rotationRef.current;
      rotationRef.current = [l + AUTO_SPEED, p];
      setRotation(rotationRef.current);
      autoRafRef.current = requestAnimationFrame(step);
    };
    autoRafRef.current = requestAnimationFrame(step);
    return () => {
      if (autoRafRef.current != null) cancelAnimationFrame(autoRafRef.current);
    };
  }, []);

  const stopAuto = () => {
    autoRef.current = false;
    if (autoRafRef.current != null) {
      cancelAnimationFrame(autoRafRef.current);
      autoRafRef.current = null;
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    stopAuto();
    draggingRef.current = true;
    movedRef.current = 0;
    lastRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current += Math.hypot(dx, dy);

    const k = 90 / RADIUS; // 度/px（半径に反比例）
    const [l, p] = rotationRef.current;
    rotationRef.current = [
      l + dx * k,
      Math.max(-PHI_CLAMP, Math.min(PHI_CLAMP, p - dy * k)),
    ];
    // pointermove ごとに setState せず rAF で1フレーム1回に間引く
    if (dragRafRef.current == null) {
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        setRotation(rotationRef.current);
      });
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // クリック合成が正しく発火するよう、up の時点で capture を解放する
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const center: [number, number] = [-rotation[0], -rotation[1]];

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div
        className="relative aspect-square w-full cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* 海（球体背景）：セクション背景に馴染む薄いグレー */}
          <path
            d={pathGen(SPHERE) ?? ""}
            fill="#e9eef5"
            stroke="#c3ccd9"
            strokeWidth={0.8}
          />
          {/* うっすら経緯線 */}
          <path
            d={pathGen(GRATICULE) ?? ""}
            fill="none"
            stroke="#d5dce6"
            strokeWidth={0.4}
          />
          {/* 国：裏面はパスが空になるので描画されない */}
          {LANDS.map((land) => {
            const d = pathGen(land.feature);
            if (!d) return null;
            const on = highlighted.has(land.id);
            return (
              <path
                key={land.uid}
                d={d}
                fill={on ? "#7dc436" : "#ffffff"}
                stroke={on ? "#ffffff" : "#c3ccd9"}
                strokeWidth={0.6}
              />
            );
          })}
        </svg>

        {/* 件数バッジ：裏側の国は非表示、回転に追従して位置更新 */}
        {entries.map(([code, count]) => {
          if (geoDistance(COORDS[code], center) >= Math.PI / 2) return null;
          const p = projection(COORDS[code]);
          if (!p) return null;
          const left = (p[0] / SIZE) * 100;
          const top = (p[1] / SIZE) * 100;
          return (
            <Link
              key={code}
              href={{ pathname: "/jobs", query: { country: code } }}
              onClick={(e) => {
                // ドラッグ直後（累計移動 >= しきい値）は誤クリック扱いで遷移させない
                if (movedRef.current >= DRAG_THRESHOLD) e.preventDefault();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-brand-primary shadow-sm transition hover:bg-brand-tab hover:shadow sm:text-xs"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {t("lp.map.badge", { name: getCountryName(locale, code), count })}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        {t("lp.map.dragHint")}
      </p>

      {/* 国リスト：スマホのみ。地球儀を回さなくても各国の検索結果へ飛べる */}
      {entries.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:hidden">
          {entries.map(([code, count]) => (
            <li key={code}>
              <Link
                href={{ pathname: "/jobs", query: { country: code } }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-primary shadow-sm transition hover:bg-brand-tab"
              >
                <span className="h-2 w-2 rounded-full bg-[#7dc436]" />
                {t("lp.map.badge", { name: getCountryName(locale, code), count })}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
