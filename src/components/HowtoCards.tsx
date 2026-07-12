"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Reveal from "./Reveal";

const SIDES = ["seek", "post"] as const;
type Side = (typeof SIDES)[number];
type IconComponent = (props: { className?: string }) => ReactNode;

// アイコンは stroke ベースの共通スタイルで生成（サイズは className で指定）
function makeIcon(paths: ReactNode): IconComponent {
  return function Icon({ className }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {paths}
      </svg>
    );
  };
}

const SearchIcon = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
);
const MegaphoneIcon = makeIcon(
  <>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </>
);
const FilterIcon = makeIcon(<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />);
const FileTextIcon = makeIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6M9 17h6" />
  </>
);
const SendIcon = makeIcon(
  <>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </>
);
const EditIcon = makeIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </>
);
const MailIcon = makeIcon(
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </>
);
const CircleCheckIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>
);

type StepDef = { icon: IconComponent; key: string };

// カードは白地。アイコン地・番号アイコンは左＝薄ネイビー系／右＝薄グリーン系、
// CTAは左＝ネイビー／右＝グリーン。色は既存テーマ変数を再利用。
const SIDE_CONFIG: Record<
  Side,
  {
    href: string;
    ctaKey: string;
    headerIcon: IconComponent;
    tile: string;
    button: string;
    steps: StepDef[];
  }
> = {
  seek: {
    href: "/jobs",
    ctaKey: "nav.findJobs",
    headerIcon: SearchIcon,
    tile: "bg-brand-tab text-brand-primary",
    button: "bg-brand-primary text-white hover:brightness-90",
    steps: [
      { icon: FilterIcon, key: "seekS1" },
      { icon: FileTextIcon, key: "seekS2" },
      { icon: SendIcon, key: "seekS3" },
    ],
  },
  post: {
    href: "/post",
    ctaKey: "nav.postJob",
    headerIcon: MegaphoneIcon,
    tile: "bg-brand-green/15 text-brand-green",
    button: "bg-brand-green text-white hover:brightness-95",
    steps: [
      { icon: EditIcon, key: "postS1" },
      { icon: MailIcon, key: "postS2" },
      { icon: CircleCheckIcon, key: "postS3" },
    ],
  },
};

function HowtoPanel({ side }: { side: Side }) {
  const t = useTranslations();
  const cfg = SIDE_CONFIG[side];
  const HeaderIcon = cfg.headerIcon;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
      {/* 上部：中央の丸アイコン＋タイトル＋サブタイトル */}
      <div className="flex flex-col items-center px-8 pt-[21px] text-center">
        <span
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${cfg.tile}`}
        >
          <HeaderIcon className="h-6 w-6" />
        </span>
        <h3 className="text-xl font-bold text-brand-primary">
          {t(`lp.howto.${side}Title`)}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t(`lp.howto.${side}Subtitle`)}
        </p>
      </div>

      {/* 区切り線 */}
      <div className="mx-8 my-[18px] border-t border-gray-200" />

      {/* 3ステップ（アイコン＋小見出し＋説明文） */}
      <div className="flex flex-1 flex-col px-8 pb-6">
        <ol className="space-y-[15px]">
          {cfg.steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <li key={step.key} className="flex gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.tile}`}
                >
                  <StepIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-primary">
                    {t(`lp.howto.${step.key}Title`)}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                    {t(`lp.howto.${step.key}Body`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-auto pt-6">
          <Link
            href={cfg.href}
            className={`btn-fx block rounded-md px-6 py-[9px] text-center text-sm font-bold shadow-sm transition ${cfg.button}`}
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
      <div className="hidden gap-[18px] md:grid md:grid-cols-2">
        {SIDES.map((side, i) => (
          <Reveal key={side} delay={i * 150} className="h-full">
            <HowtoPanel side={side} />
          </Reveal>
        ))}
      </div>

      {/* スマホ：タブ切替 */}
      <div className="md:hidden">
        <div className="mb-[15px] grid grid-cols-2 gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
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
