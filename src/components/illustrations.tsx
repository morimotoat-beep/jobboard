// LP用の2次元線画イラスト集（麻布出る杭風）
// 人物のスタイル指針：
// - 顔のパーツ（目・口）は描かない（白い顔のまま）
// - 髪は暖色（テラコッタ／ブロンド）のベタ塗り＋黒の細い輪郭
// - 白衣・服は白塗り＋黒の細い輪郭。腕脚は「黒の太線＋白の細線」の二重ストロークで輪郭付きチューブに
// - 人物の後ろにやわらかい緑の円を敷き、ポーズは動きをつける

const STROKE = "#2b2b2b";
const HAIR_RED = "#c97a50";
const HAIR_GOLD = "#e0ab4f";
const CIRCLE_BG = "#d8e8b5";

type IconProps = { className?: string };

// 輪郭付きの白い手足（黒太線の上に白細線を重ねる）
function Limb({ d, w = 6.5 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} stroke={STROKE} strokeWidth={w} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#fff" strokeWidth={w - 3} strokeLinecap="round" fill="none" />
    </>
  );
}

function Hand({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.6" fill="#fff" stroke={STROKE} strokeWidth="1.8" />;
}

function Shoe({ x, y }: { x: number; y: number }) {
  return <ellipse cx={x} cy={y} rx="5.5" ry="3" fill="#fff" stroke={STROKE} strokeWidth="1.8" />;
}

// ===== 小物アイコン =====

export function FlaskIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M21 45h22l4.5 8a4 4 0 0 1-3.5 6H20a4 4 0 0 1-3.5-6z"
        fill="#c9e265"
      />
      <path
        d="M26 8h12M28 8v15L14.5 49.5A5.5 5.5 0 0 0 19.5 58h25a5.5 5.5 0 0 0 5-8.5L36 23V8"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="49" r="2" fill="#fff" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="37" cy="52" r="1.5" fill="#fff" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  );
}

export function TestTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M27 34h10v16a5 5 0 0 1-10 0z" fill="#7dc436" opacity="0.7" />
      <path
        d="M24 8h16M27 8v42a5 5 0 0 0 10 0V8"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M27 26h10" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlaneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M6 34 58 10 42 54l-10-14z" fill="#fff" />
      <path
        d="M6 34 58 10 42 54l-10-14zM58 10 32 40"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 48c4-1 7 1 8 4M6 56c3-1 5 0 6 2"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function PaperIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M16 8h24l8 8v40H16z" fill="#fff" />
      <path
        d="M16 8h24l8 8v40H16zM40 8v8h8"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 24h18M23 32h18M23 40h12"
        stroke="#7dc436"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MicroscopeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M14 56h36" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M30 10l8-4 10 20-8 4zM34 28l6 12c2 5-1 10-6 12"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="46" r="6" fill="#c9e265" stroke={STROKE} strokeWidth="2" />
      <path d="M20 56v-5M44 56v-4" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M8 24 32 8l24 16z" fill="#eef6d6" />
      <path
        d="M8 24 32 8l24 16zM12 24v28M22 28v24M32 28v24M42 28v24M52 24v28M8 54h48"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="18" r="2.5" fill="#7dc436" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="#c9e265" stroke={STROKE} strokeWidth="2" />
      <ellipse cx="32" cy="32" rx="9" ry="22" stroke={STROKE} strokeWidth="1.3" fill="none" />
      <path d="M10 26h44M10 38h44" stroke={STROKE} strokeWidth="1.3" />
    </svg>
  );
}

export function MoleculeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M20 42 32 22l14 14" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="44" r="7" fill="#c9e265" stroke={STROKE} strokeWidth="2" />
      <circle cx="32" cy="20" r="6" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <circle cx="48" cy="38" r="7" fill="#7dc436" stroke={STROKE} strokeWidth="2" />
    </svg>
  );
}

// 安心感を示す盾＋チェックマーク（個人情報を扱わない説明用）
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M32 6l20 8v16c0 14-8 23-20 28C20 53 12 44 12 30V14z"
        fill="#eef6d6"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 31l7 7 12-14"
        stroke="#7dc436"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z"
        fill="#c9e265"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ===== 人物（顔なし・暖色の髪・輪郭付き白衣） =====

// 特徴1「完全無料」：両手を上げて喜ぶ研究者
export function ResearcherFree({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" aria-hidden="true">
      <circle cx="60" cy="72" r="46" fill={CIRCLE_BG} />
      {/* 脚・靴 */}
      <Limb d="M53 100l-4 15" />
      <Limb d="M68 100l3 15" />
      <Shoe x={47} y={118} />
      <Shoe x={73} y={118} />
      {/* 白衣（裾が広がる） */}
      <path
        d="M47 102c-4-17-3-29 1-38 3-8 8-12 13-12s10 4 13 12c4 9 5 21 2 38-10 2-19 2-29 0z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M61 54l1 48" stroke={STROKE} strokeWidth="1.2" />
      {/* 両腕を上げる */}
      <Limb d="M50 60C44 53 41 45 42 36" />
      <Limb d="M72 60c6-7 9-15 8-24" />
      <Hand x={42} y={34} />
      <Hand x={80} y={34} />
      {/* 頭（顔は描かない） */}
      <circle cx="61" cy="32" r="13.5" fill="#fff" stroke={STROKE} strokeWidth="2" />
      {/* 髪（サイドに流す） */}
      <path
        d="M48 31c-1-11 6-19 13-19 9 0 15 8 14 18-2-5-5-8-9-9 1 2 1 3 0 5-4-4-10-3-13 1-2 2-4 4-5 4z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* よろこびの飾り */}
      <path d="M28 38l4 4M33 33l3 5" stroke="#ff5757" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M92 46c.7 3 1.8 4.2 5 5-3.2.8-4.3 2-5 5-.7-3-1.8-4.2-5-5 3.2-.8 4.3-2 5-5z"
        fill="#c9e265"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 特徴2「グローバル対応」：地球儀を指さす研究者
export function ResearcherGlobal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" aria-hidden="true">
      <circle cx="58" cy="72" r="46" fill={CIRCLE_BG} />
      <Limb d="M50 100l-3 15" />
      <Limb d="M64 100l4 14" />
      <Shoe x={45} y={118} />
      <Shoe x={70} y={117} />
      <path
        d="M44 102c-4-17-3-29 1-38 3-8 8-12 13-12s10 4 13 12c4 9 5 21 2 38-10 2-19 2-29 0z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M58 54l1 48" stroke={STROKE} strokeWidth="1.2" />
      {/* 右腕で地球儀を指す・左手は腰 */}
      <Limb d="M68 62c9-3 16-8 21-16" />
      <Limb d="M47 62c-4 5-5 10-3 15" />
      <Hand x={90} y={45} />
      {/* 頭・髪（ブロンドのポニーテール） */}
      <circle cx="58" cy="32" r="13.5" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M45 31c-1-11 6-19 13-19 9 0 15 8 14 18-2-5-5-8-9-9 1 2 1 3 0 5-4-4-10-3-13 1-2 2-4 4-5 4z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M44 26c-5 1-8 5-8 10 3-2 6-3 8-2z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* 地球儀 */}
      <circle cx="98" cy="34" r="13" fill="#c9e265" stroke={STROKE} strokeWidth="2" />
      <ellipse cx="98" cy="34" rx="5" ry="13" stroke={STROKE} strokeWidth="1.2" fill="none" />
      <path d="M85.5 31h25M85.5 38h25" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  );
}

// 特徴1「公式ページへの架け橋」：点線の橋で大学へ案内する研究者
export function ResearcherBridge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" aria-hidden="true">
      <circle cx="60" cy="72" r="46" fill={CIRCLE_BG} />
      {/* 大学（右上） */}
      <path d="M80 50 96 41l16 9z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M84 50v12M96 50v12M108 50v12M80 62h32" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* 橋のアーチ（点線）＋矢印 */}
      <path
        d="M44 102C62 98 80 88 90 72"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <path d="M93 66l-8 2 5 5z" fill={STROKE} />
      {/* 研究者（左・案内のポーズ） */}
      <Limb d="M34 96l-3 14" />
      <Limb d="M46 96l3 14" />
      <Shoe x={29} y={112} />
      <Shoe x={51} y={112} />
      <path
        d="M28 98c-3-15-2-26 1-34 3-7 7-11 12-11s9 4 12 11c3 8 4 19 1 34-9 2-17 2-26 0z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M41 53l1 45" stroke={STROKE} strokeWidth="1.2" />
      <Limb d="M50 60c8-2 14-6 18-12" />
      <Hand x={69} y={46} />
      <Limb d="M31 60c-3 5-4 10-2 14" />
      <circle cx="41" cy="31" r="13" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M28.5 30c-1-10 5.5-18 12.5-18 8.5 0 14.5 8 13.5 17-2-5-5-7.5-8.5-8.5 1 2 1 3 0 4.5-4-3.5-9.5-2.5-12.5 1-2 2-4 4-5 4z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 特徴2「誰でも載せられる」：クリップボードに記入する研究者
export function ResearcherForm({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" aria-hidden="true">
      <circle cx="60" cy="72" r="46" fill={CIRCLE_BG} />
      <Limb d="M52 100l-3 15" />
      <Limb d="M66 100l3 15" />
      <Shoe x={47} y={118} />
      <Shoe x={71} y={118} />
      <path
        d="M46 102c-4-17-3-29 1-38 3-8 8-12 13-12s10 4 13 12c4 9 5 21 2 38-10 2-19 2-29 0z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M60 54l1 48" stroke={STROKE} strokeWidth="1.2" />
      {/* クリップボード */}
      <path
        d="M34 60l28-7 5 21-28 7z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M46 55l9-2 1 4-9 2z" fill="#c9e265" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M42 66l15-4M44 72l15-4" stroke="#7dc436" strokeWidth="2" strokeLinecap="round" />
      {/* 腕とペン */}
      <Limb d="M50 62c-4 1-8 3-11 6" />
      <Limb d="M70 60c2 3 2 6 1 9" />
      <Hand x={39} y={69} />
      <Hand x={69} y={71} />
      <path d="M69 70l8-7" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* 頭・髪 */}
      <circle cx="60" cy="32" r="13.5" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M47 31c-1-11 6-19 13-19 9 0 15 8 14 18-2-5-5-8-9-9 1 2 1 3 0 5-4-4-10-3-13 1-2 2-4 4-5 4z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M46 26c-5 1-8 5-8 10 3-2 6-3 8-2z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 特徴3「自動でクリーン」：ほうきを持つ研究者＋キラキラ
export function ResearcherClean({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" aria-hidden="true">
      <circle cx="58" cy="72" r="46" fill={CIRCLE_BG} />
      <Limb d="M50 100l-3 15" />
      <Limb d="M64 100l3 15" />
      <Shoe x={45} y={118} />
      <Shoe x={69} y={118} />
      <path
        d="M44 102c-4-17-3-29 1-38 3-8 8-12 13-12s10 4 13 12c4 9 5 21 2 38-10 2-19 2-29 0z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M58 54l1 48" stroke={STROKE} strokeWidth="1.2" />
      {/* ほうき */}
      <path d="M84 46l5 44" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M80 90h19l4 13c-9 5-19 5-27 0z"
        fill="#c9e265"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 両腕でほうきを持つ */}
      <Limb d="M68 60c6 0 12-1 17-5" />
      <Limb d="M50 64c4 7 10 11 18 11" />
      <Hand x={86} y={54} />
      <Hand x={70} y={76} />
      {/* 頭・髪 */}
      <circle cx="58" cy="32" r="13.5" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M45 31c-1-11 6-19 13-19 9 0 15 8 14 18-2-5-5-8-9-9 1 2 1 3 0 5-4-4-10-3-13 1-2 2-4 4-5 4z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M71 26c5 0 9 4 9 9-3-2-6-3-9-2z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* キラキラ */}
      <path
        d="M22 54c.7 3 1.8 4.2 5 5-3.2.8-4.3 2-5 5-.7-3-1.8-4.2-5-5 3.2-.8 4.3-2 5-5z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M104 64l3 4M109 58l2 5" stroke="#7dc436" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 白パネルの右端に「またがる」用の研究者（背景円なし・手を振る）
export function ResearcherWave({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 116" className={className} fill="none" aria-hidden="true">
      <g transform="rotate(-4 60 60)">
        <Limb d="M52 92l-3 13" />
        <Limb d="M66 92l3 13" />
        <Shoe x={47} y={107} />
        <Shoe x={71} y={107} />
        <path
          d="M46 94c-4-15-3-26 1-34 3-7 8-11 13-11s10 4 13 11c4 8 5 19 2 34-10 2-19 2-29 0z"
          fill="#fff"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M60 50l1 43" stroke={STROKE} strokeWidth="1.2" />
        {/* 手を振る */}
        <Limb d="M50 56c-7-4-11-10-12-18" />
        <Limb d="M71 58c4 5 5 11 4 17" />
        <Hand x={38} y={36} />
        {/* 頭・髪 */}
        <circle cx="60" cy="29" r="13" fill="#fff" stroke={STROKE} strokeWidth="2" />
        <path
          d="M47.5 28c-1-10 5.5-18 12.5-18 8.5 0 14.5 8 13.5 17-2-5-5-7.5-8.5-8.5 1 2 1 3 0 4.5-4-3.5-9.5-2.5-12.5 1-2 2-4 4-5 4z"
          fill={HAIR_GOLD}
          stroke={STROKE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M27 28l3 4M32 23l3 5" stroke="#ff5757" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ヒーロー用：研究者＋大きな地球儀＋周回する飛行機
export function HeroIllustration({ className }: IconProps) {
  return (
    <svg viewBox="0 0 280 230" className={className} fill="none" aria-hidden="true">
      {/* 地球儀 */}
      <circle cx="170" cy="110" r="72" fill="#c9e265" stroke={STROKE} strokeWidth="2.5" />
      <ellipse cx="170" cy="110" rx="30" ry="72" stroke={STROKE} strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M99 92h142M99 128h142M112 60h116M112 160h116" stroke={STROKE} strokeWidth="1.3" opacity="0.55" />
      {/* 大陸（ゆるい形） */}
      <path d="M135 80q14-12 30-6t8 18q-8 10-22 6t-16-18z" fill="#7dc436" opacity="0.75" />
      <path d="M190 125q12-4 18 4t-4 16q-10 4-16-4t2-16z" fill="#7dc436" opacity="0.75" />
      <path d="M140 130q8 0 10 8t-6 12q-10 0-11-8t7-12z" fill="#7dc436" opacity="0.6" />
      {/* 台座 */}
      <path d="M170 182v14M152 200h36" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      {/* 周回軌道と飛行機 */}
      <ellipse cx="170" cy="108" rx="98" ry="38" stroke={STROKE} strokeWidth="1.3" strokeDasharray="5 6" fill="none" opacity="0.6" />
      <g transform="translate(248 76) rotate(20)">
        <path d="M0 8 22 0 15 18l-5-6z" fill="#fff" stroke={STROKE} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      {/* 研究者（顔なし・地球儀を指さす） */}
      <g transform="translate(-4 84) scale(0.98)">
        <Limb d="M42 100l-4 16" />
        <Limb d="M56 100l4 16" />
        <Shoe x={36} y={119} />
        <Shoe x={62} y={119} />
        <path
          d="M36 102c-4-16-3-28 1-37 3-8 8-12 13-12s10 4 13 12c4 9 5 21 2 37-10 2-19 2-29 0z"
          fill="#fff"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M50 54l1 47" stroke={STROKE} strokeWidth="1.2" />
        {/* 地球儀を指さす腕・反対の腕は後ろへ */}
        <Limb d="M60 62c10-4 17-10 22-19" />
        <Limb d="M39 62c-5 4-7 9-6 15" />
        <Hand x={83} y={41} />
        <circle cx="50" cy="32" r="13.5" fill="#fff" stroke={STROKE} strokeWidth="2" />
        <path
          d="M37 31c-1-11 6-19 13-19 9 0 15 8 14 18-2-5-5-8-9-9 1 2 1 3 0 5-4-4-10-3-13 1-2 2-4 4-5 4z"
          fill={HAIR_RED}
          stroke={STROKE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M36 26c-5 1-8 5-8 10 3-2 6-3 8-2z"
          fill={HAIR_RED}
          stroke={STROKE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>
      {/* キラキラ */}
      <path
        d="M252 160c.8 3.6 2 5 6 6-4 1-5.2 2.4-6 6-.8-3.6-2-5-6-6 4-1 5.2-2.4 6-6z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M70 30l3 5M77 26l2 6" stroke="#ff5757" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ===== 「つかいかた」セクションのステップアイコン（顔なし・暖色の髪） =====

// 探す①：虫眼鏡で検索する研究者
export function StepSearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="20" cy="21" r="8" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M12.5 20c-.5-6 3.5-11 8-11 5.5 0 9 5 8.5 10.5-1.2-3-3-4.5-5-5 .5 1 .5 2 0 3-2.5-2.5-6-2-8 .5-1.4 1.2-2.7 2-3.5 2z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 52V40c0-6 3.6-10 8-10s8 4 8 10v12z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 35l7 5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="42" cy="35" r="9" fill="#deeaea" stroke={STROKE} strokeWidth="2" />
      <path d="M49 42l8 8" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M37.5 33c1-2 2.5-3 4.5-3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 探す②：書類を読む人
export function StepReadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="32" cy="16" r="8" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M24.5 15c-.5-6 3.5-11 8-11 5.5 0 9 5 8.5 10.5-1.2-3-3-4.5-5-5 .5 1 .5 2 0 3-2.5-2.5-6-2-8 .5-1.4 1.2-2.7 2-3.5 2z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 32c8-4 14-4 22 0v20c-8-4-14-4-22 0z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M54 32c-8-4-14-4-22 0v20c8-4 14-4 22 0z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 38c5-2 9-2 13 0M15 44c5-2 9-2 13 0" stroke="#7dc436" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 38c4-2 8-2 13 0M36 44c4-2 8-2 13 0" stroke="#7dc436" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 探す③：大学の建物へ向かう人
export function StepCampusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M30 22 46 12l16 10z" fill="#eef6d6" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M34 22v20M46 22v20M58 22v20M30 42h32" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="24" r="6" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M6.5 23c-.4-4.5 2.6-8 5.5-8 3.5 0 6.2 3.5 5.8 7.5-.9-2.2-2.2-3.3-3.7-3.7.4.8.4 1.5 0 2.2-1.9-1.9-4.5-1.5-6 .4-1 1-2 1.6-1.6 1.6z"
        fill={HAIR_RED}
        stroke={STROKE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 44v-6c0-3.5 1.8-6 4-6s4 2.5 4 6v6" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 44l-3 8M14 44l4 7M16 34l5-3" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 56q14 4 26-8" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" />
    </svg>
  );
}

// 載せる①：フォームに記入する人
export function StepFormIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M18 8h28v44H18z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 18h16M24 26h16M24 34h10" stroke="#7dc436" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="36" r="6" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path
        d="M3.5 35c-.4-4.5 2.6-8 5.5-8 3.5 0 6.2 3.5 5.8 7.5-.9-2.2-2.2-3.3-3.7-3.7.4.8.4 1.5 0 2.2-1.9-1.9-4.5-1.5-6 .4-1 1-2 1.6-1.6 1.6z"
        fill={HAIR_GOLD}
        stroke={STROKE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 41l6 3" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 30 42 48l-7 2 2-7 18-18z" fill="#c9e265" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M53 27l5 5" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  );
}

// 載せる②：メールが届く封筒
export function StepMailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <rect x="12" y="20" width="42" height="28" rx="3" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <path d="M12 23 33 38l21-15" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="52" cy="20" r="6" fill="#ff5757" stroke={STROKE} strokeWidth="2" />
      <path d="M2 28h6M2 36h8M2 44h5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// 載せる③：公開を知らせるメガホン＋地球儀
export function StepPublishIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M14 26l24-12v28L14 36z" fill="#7dc436" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 26h5v10H9z" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 38l3 12 6-2-3-9" fill="#fff" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M42 22c5 3 5 13 0 16" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="16" r="9" fill="#c9e265" stroke={STROKE} strokeWidth="2" />
      <ellipse cx="52" cy="16" rx="3.5" ry="9" stroke={STROKE} strokeWidth="1.2" fill="none" />
      <path d="M43 14h18M43 19h18" stroke={STROKE} strokeWidth="1.2" />
      <path d="M44 46l3 4M50 44l2 5" stroke="#ff5757" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
