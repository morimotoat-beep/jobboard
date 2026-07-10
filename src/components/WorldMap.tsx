import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { getCountryName } from "@/lib/countries";
import type { Locale } from "@/lib/filters";

// world-atlas（Natural Earth 110m）による正確な世界地図。
// 求人がある国を #7dc436 でハイライトし、件数バッジを首都付近に表示する。

const WIDTH = 800;
const HEIGHT = 400;

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

// バッジ位置用の代表座標 [経度, 緯度]（首都付近）
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

// 地図パスはモジュール読み込み時に1回だけ生成（サーバー側のみ）
/* eslint-disable @typescript-eslint/no-explicit-any */
const topology = worldAtlas as any;
const allFeatures = (feature(topology, topology.objects.countries) as any)
  .features as Array<{ id: unknown }>;
// 南極は除外して描画範囲を最適化
const landFeatures = allFeatures.filter((f) => String(f.id) !== "010");
const collection = { type: "FeatureCollection", features: landFeatures };
const projection = geoNaturalEarth1().fitExtent(
  [
    [2, 2],
    [WIDTH - 2, HEIGHT - 2],
  ],
  collection as any
);
const pathGen = geoPath(projection);
const LAND_PATHS: { id: string; uid: string; d: string }[] = landFeatures.map(
  (f, i) => ({
    id: String(f.id).padStart(3, "0"),
    // f.id が未定義/重複でも一意になるキー（配列インデックスを付与）
    uid: `${String(f.id)}-${i}`,
    d: pathGen(f as any) ?? "",
  })
);
/* eslint-enable @typescript-eslint/no-explicit-any */

function project(code: string): { x: number; y: number } | null {
  const coords = COORDS[code];
  if (!coords) return null;
  const p = projection(coords);
  if (!p) return null;
  return { x: (p[0] / WIDTH) * 100, y: (p[1] / HEIGHT) * 100 };
}

export default function WorldMap({ counts }: { counts: Record<string, number> }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  const entries = Object.entries(counts)
    .filter(([code, count]) => count > 0 && COORDS[code])
    .sort((a, b) => b[1] - a[1]);
  const highlighted = new Set(entries.map(([code]) => NUMERIC_ID[code]));

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 地図：スマホは横スクロールで拡大表示（狭い画面で潰れないように） */}
      <div
        className="overflow-x-auto pb-2 sm:overflow-visible sm:pb-0"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="relative mx-auto min-w-[600px] sm:min-w-0">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" aria-hidden="true">
            {LAND_PATHS.map((land) => (
              <path
                key={land.uid}
                d={land.d}
                fill={highlighted.has(land.id) ? "#7dc436" : "#ffffff"}
                stroke={highlighted.has(land.id) ? "#ffffff" : "#c3ccd9"}
                strokeWidth="0.6"
              />
            ))}
          </svg>

          {/* バッジ：クリックでその国のフィルター付き検索結果へ */}
          {entries.map(([code, count]) => {
            const pos = project(code);
            if (!pos) return null;
            return (
              <Link
                key={code}
                href={{ pathname: "/jobs", query: { country: code } }}
                className="absolute -translate-x-1/2 -translate-y-[160%] rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-brand-primary shadow-sm transition hover:bg-brand-tab hover:shadow sm:text-xs"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {t("lp.map.badge", {
                  name: getCountryName(locale, code),
                  count,
                })}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 国リスト：スマホのみ。地図が小さくてもタップで各国の検索結果へ飛べる */}
      {entries.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:hidden">
          {entries.map(([code, count]) => (
            <li key={code}>
              <Link
                href={{ pathname: "/jobs", query: { country: code } }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-primary shadow-sm transition hover:bg-brand-tab"
              >
                <span className="h-2 w-2 rounded-full bg-[#7dc436]" />
                {t("lp.map.badge", {
                  name: getCountryName(locale, code),
                  count,
                })}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
