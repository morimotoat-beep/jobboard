"use client";

import { useEffect, useState } from "react";

// ヒーロー背景の装飾レイヤー：研究都市をノードで結び、
// 「世界中の研究ネットワークに接続している」印象をさりげなく作る。
// aria-hidden の純粋な装飾。キャッチコピー・CTA の可読性を最優先し、
// 透明度は控えめ・prefers-reduced-motion では静止画として表示する。

type Node = {
  name: string;
  x: number;
  y: number;
  // ラベルの寄せ（ノードに重ならない向きへ逃がす）
  lx: number;
  ly: number;
  anchor: "start" | "end";
};

// viewBox 1200x600 上の代表都市（首都圏付近を目分量で配置）
const NODES: Node[] = [
  { name: "BOSTON", x: 230, y: 200, lx: 12, ly: -10, anchor: "start" },
  { name: "LONDON", x: 520, y: 150, lx: -12, ly: -10, anchor: "end" },
  { name: "BERLIN", x: 600, y: 180, lx: 12, ly: 22, anchor: "start" },
  { name: "SINGAPORE", x: 880, y: 400, lx: 12, ly: 20, anchor: "start" },
  { name: "TOKYO", x: 1000, y: 230, lx: -12, ly: -10, anchor: "end" },
];

const byName = (n: string) => NODES.find((node) => node.name === n)!;

// 2ノードを結ぶ二次ベジェ（中点を上へ持ち上げてゆるい弧にする）
function curve(a: Node, b: Node, bow: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - bow;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

const LINKS: { id: string; from: string; to: string; bow: number }[] = [
  { id: "hn-l0", from: "BOSTON", to: "LONDON", bow: 60 },
  { id: "hn-l1", from: "LONDON", to: "BERLIN", bow: 24 },
  { id: "hn-l2", from: "BERLIN", to: "TOKYO", bow: 70 },
  { id: "hn-l3", from: "TOKYO", to: "SINGAPORE", bow: 50 },
  { id: "hn-l4", from: "BERLIN", to: "SINGAPORE", bow: 90 },
  { id: "hn-l5", from: "BOSTON", to: "BERLIN", bow: 80 },
];

const PATHS = LINKS.map((l) => ({
  ...l,
  d: curve(byName(l.from), byName(l.to), l.bow),
}));

// 線上を流れる光点はこの3本に乗せる
const FLOW_IDS = ["hn-l0", "hn-l2", "hn-l3"];

export default function HeroNetwork() {
  // prefers-reduced-motion の間はアニメーション要素を描かず静止画にする
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none"
    >
      <style>{`
        @keyframes hnPulse {
          0%   { r: 3px;  opacity: 0.45; }
          100% { r: 26px; opacity: 0; }
        }
        .hn-pulse { animation: hnPulse 3s ease-out infinite; }
      `}</style>
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {/* 接続曲線：ネイビーの極薄ライン */}
        <g fill="none" stroke="var(--color-brand-primary)" strokeWidth={1}>
          {PATHS.map((p, i) => (
            <path
              key={p.id}
              id={p.id}
              d={p.d}
              style={{ opacity: 0.12 + (i % 3) * 0.02 }}
            />
          ))}
        </g>

        {/* 各ノード：静止の中心点＋（動作時のみ）外へ広がる発光パルス */}
        {NODES.map((n, i) => (
          <g key={n.name}>
            {animate && (
              <circle
                className="hn-pulse"
                cx={n.x}
                cy={n.y}
                r={3}
                fill="var(--color-brand-point)"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            )}
            <circle cx={n.x} cy={n.y} r={3} fill="var(--color-brand-point)" />
            <circle
              cx={n.x}
              cy={n.y}
              r={5.5}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={1}
              style={{ opacity: 0.35 }}
            />
            {/* 都市名ラベル：モバイル（sm未満）では非表示 */}
            <text
              x={n.x + n.lx}
              y={n.y + n.ly}
              textAnchor={n.anchor}
              className="hidden font-mono sm:block"
              fill="var(--color-brand-primary)"
              fontSize={10}
              letterSpacing={1.5}
              style={{ opacity: 0.25 }}
            >
              {n.name}
            </text>
          </g>
        ))}

        {/* 線上を流れる光点：動作時のみ。ごく控えめ（opacity <= 0.5） */}
        {animate &&
          FLOW_IDS.map((id, i) => (
            <circle key={id} r={2.5} fill="var(--color-brand-point)" opacity={0.5}>
              <animateMotion
                dur={`${5 + i * 1.5}s`}
                begin={`${i * 1.2}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>
    </div>
  );
}
