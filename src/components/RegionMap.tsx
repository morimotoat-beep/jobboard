import { getRegionMapData, MAP_W, MAP_H } from "@/lib/regionMaps";

// 求人の所在地を示す地域ズーム地図（サーバーコンポーネント）。
// 該当国を緑でハイライトし、所在地（国内求人は都道府県）に赤のマーカーを打つ。
export default function RegionMap({
  country,
  prefecture,
  className = "",
}: {
  country: string;
  prefecture?: string | null;
  className?: string;
}) {
  const data = getRegionMapData(country, prefecture);
  if (!data) return null;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={MAP_W} height={MAP_H} fill="#eef3f8" />
      {data.paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          fill={p.id === data.targetId ? "#7dc436" : "#ffffff"}
          stroke={p.id === data.targetId ? "#ffffff" : "#c3ccd9"}
          strokeWidth="0.8"
        />
      ))}
      {data.marker && (
        <g transform={`translate(${data.marker.x}, ${data.marker.y})`}>
          <circle r="9" fill="rgba(173, 58, 45, 0.25)" />
          <circle r="4.5" fill="#ad3a2d" stroke="#ffffff" strokeWidth="1.8" />
        </g>
      )}
    </svg>
  );
}
