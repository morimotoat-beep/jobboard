// 求人カード用の「地域ズーム地図」データ。
// world-atlas（Natural Earth 110m）から、地域ごとに拡大した投影の
// SVGパスを生成する。モジュール読み込み時に1回だけ計算（サーバー側のみ）。
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

export const MAP_W = 300;
export const MAP_H = 200;
const PADDING = 14;

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

// 国の代表座標 [経度, 緯度]（マーカー用・首都付近）
const COUNTRY_COORDS: Record<string, [number, number]> = {
  JP: [138, 36], KR: [127, 37.5], CN: [116.4, 39.9], TW: [121.5, 25],
  HK: [114.2, 22.3], SG: [103.85, 1.3], IN: [77.2, 28.6], TH: [100.5, 13.7],
  MY: [101.7, 3.1], VN: [105.8, 21], ID: [106.8, -6.2], AU: [149.1, -35.3],
  NZ: [174.8, -41.3], US: [-98, 39], CA: [-75.7, 45.4], GB: [-0.1, 51.5],
  DE: [13.4, 52.5], FR: [2.35, 48.85], NL: [4.9, 52.4], CH: [7.45, 46.95],
  SE: [18.1, 59.3], DK: [12.6, 55.7], NO: [10.7, 59.9], FI: [24.9, 60.2],
  AT: [16.4, 48.2], BE: [4.35, 50.85], IE: [-6.3, 53.35], IT: [12.5, 41.9],
  ES: [-3.7, 40.4], PT: [-9.1, 38.7], PL: [21, 52.2], CZ: [14.4, 50.1],
  IL: [35.2, 31.8], SA: [46.7, 24.6], AE: [54.4, 24.5], QA: [51.5, 25.3],
  BR: [-47.9, -15.8], MX: [-99.1, 19.4], ZA: [28.2, -25.7],
};

// 都道府県の代表座標（県庁所在地付近）
const PREFECTURE_COORDS: Record<string, [number, number]> = {
  hokkaido: [141.35, 43.06], aomori: [140.74, 40.82], iwate: [141.15, 39.7],
  miyagi: [140.87, 38.27], akita: [140.1, 39.72], yamagata: [140.36, 38.24],
  fukushima: [140.47, 37.75], ibaraki: [140.45, 36.34], tochigi: [139.88, 36.57],
  gunma: [139.06, 36.39], saitama: [139.65, 35.86], chiba: [140.12, 35.61],
  tokyo: [139.69, 35.69], kanagawa: [139.64, 35.45], niigata: [139.02, 37.9],
  toyama: [137.21, 36.7], ishikawa: [136.63, 36.59], fukui: [136.22, 36.07],
  yamanashi: [138.57, 35.66], nagano: [138.18, 36.65], gifu: [136.72, 35.39],
  shizuoka: [138.38, 34.98], aichi: [136.91, 35.18], mie: [136.51, 34.73],
  shiga: [135.87, 35.0], kyoto: [135.76, 35.02], osaka: [135.52, 34.69],
  hyogo: [135.18, 34.69], nara: [135.83, 34.69], wakayama: [135.17, 34.23],
  tottori: [134.24, 35.5], shimane: [133.05, 35.47], okayama: [133.93, 34.66],
  hiroshima: [132.46, 34.4], yamaguchi: [131.47, 34.19], tokushima: [134.56, 34.07],
  kagawa: [134.04, 34.34], ehime: [132.77, 33.84], kochi: [133.53, 33.56],
  fukuoka: [130.42, 33.61], saga: [130.3, 33.25], nagasaki: [129.87, 32.74],
  kumamoto: [130.74, 32.79], oita: [131.61, 33.24], miyazaki: [131.42, 31.91],
  kagoshima: [130.56, 31.56], okinawa: [127.68, 26.21],
};

// 地域の定義：members に含まれる国がこの地域にズームされる。
// 投影は fit に含めた国に合わせ、周辺国は同じ投影で描いて viewBox で切る。
type RegionDef = { fit: string[] };
const REGIONS: Record<string, RegionDef> = {
  japan: { fit: ["JP"] },
  "east-asia": { fit: ["KR", "CN", "TW", "HK", "JP"] },
  "south-asia": { fit: ["SG", "IN", "TH", "MY", "VN", "ID"] },
  oceania: { fit: ["AU", "NZ"] },
  "north-america": { fit: ["US", "CA"] },
  europe: {
    fit: ["GB", "DE", "FR", "NL", "CH", "SE", "DK", "NO", "FI",
          "AT", "BE", "IE", "IT", "ES", "PT", "PL", "CZ"],
  },
  "middle-east": { fit: ["IL", "SA", "AE", "QA"] },
  "latin-america": { fit: ["BR", "MX"] },
  africa: { fit: ["ZA"] },
};

const COUNTRY_TO_REGION: Record<string, string> = {
  JP: "japan",
  KR: "east-asia", CN: "east-asia", TW: "east-asia", HK: "east-asia",
  SG: "south-asia", IN: "south-asia", TH: "south-asia", MY: "south-asia",
  VN: "south-asia", ID: "south-asia",
  AU: "oceania", NZ: "oceania",
  US: "north-america", CA: "north-america",
  GB: "europe", DE: "europe", FR: "europe", NL: "europe", CH: "europe",
  SE: "europe", DK: "europe", NO: "europe", FI: "europe", AT: "europe",
  BE: "europe", IE: "europe", IT: "europe", ES: "europe", PT: "europe",
  PL: "europe", CZ: "europe",
  IL: "middle-east", SA: "middle-east", AE: "middle-east", QA: "middle-east",
  BR: "latin-america", MX: "latin-america",
  ZA: "africa",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const topology = worldAtlas as any;
const allFeatures = (feature(topology, topology.objects.countries) as any)
  .features as Array<{ id: unknown }>;
const landFeatures = allFeatures.filter((f) => String(f.id) !== "010");

type RegionData = {
  // viewBox 内に見えるパスだけ（id は numeric 3桁）
  paths: { id: string; uid: string; d: string }[];
  projection: GeoProjection;
};

function buildRegion(def: RegionDef): RegionData | null {
  const fitFeatures = landFeatures.filter((f) =>
    def.fit.some((c) => NUMERIC_ID[c] === String(f.id).padStart(3, "0"))
  );
  if (fitFeatures.length === 0) return null;
  const collection = { type: "FeatureCollection", features: fitFeatures };
  const projection = geoNaturalEarth1().fitExtent(
    [
      [PADDING, PADDING],
      [MAP_W - PADDING, MAP_H - PADDING],
    ],
    collection as any
  );
  // viewBox 外の形状を投影段階で切り落とす（ロシア等の巨大ポリゴン対策）
  projection.clipExtent([
    [-4, -4],
    [MAP_W + 4, MAP_H + 4],
  ]);
  // 座標は整数で十分（SVGサイズ削減）
  const pathGen = geoPath(projection).digits(0);
  const paths: { id: string; uid: string; d: string }[] = [];
  for (const f of landFeatures) {
    const d = pathGen(f as any);
    // クリップの結果、viewBox 内に形状が残らない国はスキップ
    if (!d) continue;
    const id = String(f.id).padStart(3, "0");
    // 数px しかない微小な島などは描かない（対象国は常に残す）
    const b = pathGen.bounds(f as any);
    const isTarget = def.fit.some((c) => NUMERIC_ID[c] === id);
    if (!isTarget && b[1][0] - b[0][0] < 3 && b[1][1] - b[0][1] < 3) continue;
    // f.id が未定義/重複でも一意になるキー（描画順の連番を付与）
    paths.push({ id, uid: `${id}-${paths.length}`, d });
  }
  return { paths, projection };
}

const REGION_DATA: Record<string, RegionData | null> = Object.fromEntries(
  Object.entries(REGIONS).map(([key, def]) => [key, buildRegion(def)])
);
/* eslint-enable @typescript-eslint/no-explicit-any */

export type RegionMapData = {
  paths: { id: string; uid: string; d: string }[];
  targetId: string | null;
  marker: { x: number; y: number } | null;
};

// 国コード（＋日本のみ都道府県コード）から地図データを取得する
export function getRegionMapData(
  country: string,
  prefecture?: string | null
): RegionMapData | null {
  const regionKey = COUNTRY_TO_REGION[country];
  if (!regionKey) return null;
  const region = REGION_DATA[regionKey];
  if (!region) return null;

  const coords =
    country === "JP" && prefecture && PREFECTURE_COORDS[prefecture]
      ? PREFECTURE_COORDS[prefecture]
      : COUNTRY_COORDS[country];
  let marker: { x: number; y: number } | null = null;
  if (coords) {
    const p = region.projection(coords);
    if (p) marker = { x: p[0], y: p[1] };
  }

  return {
    paths: region.paths,
    targetId: NUMERIC_ID[country] ?? null,
    marker,
  };
}
