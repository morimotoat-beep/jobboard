import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import JobSitesPreview from "@/components/JobSitesPreview";
import JobsCarousel from "@/components/JobsCarousel";
import Reveal from "@/components/Reveal";
import WorldMap from "@/components/WorldMap";
import { Link } from "@/i18n/navigation";
import { getCountryCounts, getLatestListings } from "@/lib/listings";
import {
  BuildingIcon,
  FlaskIcon,
  HeroIllustration,
  MicroscopeIcon,
  MoleculeIcon,
  PaperIcon,
  PlaneIcon,
  ResearcherBridge,
  ResearcherClean,
  ResearcherForm,
  ResearcherGlobal,
  ResearcherWave,
  ShieldIcon,
  SparkleIcon,
  StepCampusIcon,
  StepFormIcon,
  StepMailIcon,
  StepPublishIcon,
  StepReadIcon,
  StepSearchIcon,
  TestTubeIcon,
} from "@/components/illustrations";

// つかいかたセクション：各ステップのイラスト
const HOWTO_STEPS = {
  seek: [StepSearchIcon, StepReadIcon, StepCampusIcon],
  post: [StepFormIcon, StepMailIcon, StepPublishIcon],
} as const;

const HOWTO_HEAD_ICONS = {
  seek: StepSearchIcon,
  post: StepFormIcon,
} as const;

// 求人数・新着は10分ごとに再生成（毎リクエストのDBアクセスを避ける）
export const revalidate = 600;

// 麻布出る杭風レイアウトの型：
// 特大英字（最上部・白＋やや透明）→ 白い角丸パネル（タイトル＋説明、英字の下端に重なる）
// → パネル右端にまたがるイラスト → パネルの下にコンテンツ
function PatternSection({
  bgClass,
  word,
  title,
  desc,
  side,
  decorations,
  children,
}: {
  bgClass: string;
  word: string;
  title: string;
  desc?: string;
  side?: React.ReactNode;
  decorations?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden px-4 pb-16 ${bgClass}`}>
      {/* 特大英字（参考サイトのPROJECT準拠）：2層構造で文字下端がパネルに「沈み込む」
          - 縁取りあり層：パネルの下（重なった縁取りはパネルに隠れる）
          - 白ベタ層：パネルの上（重なった部分のパネル枠線を白で覆い、白同士で溶け込む） */}
      <div
        aria-hidden="true"
        className="relative -mb-[3vw] pt-3 text-center text-[15vw] leading-none font-black tracking-tight whitespace-nowrap select-none sm:-mb-[2vw] sm:text-[11vw]"
      >
        <span className="text-outline-white absolute inset-x-0 top-3 z-0">
          {word}
        </span>
        <span className="relative z-20 text-white">{word}</span>
      </div>
      <Reveal className="relative z-10">
        {/* pt は英字の沈み込み分（vw連動）＋余白を確保し、日本語タイトルが英字と重ならないようにする */}
        <div className="panel-outline relative mx-auto w-[95%] max-w-5xl bg-white px-6 pt-[max(1.75rem,4.5vw)] pb-8 text-center sm:pt-[max(2rem,3vw)]">
          {decorations}
          <h2 className="mb-4 text-3xl font-black text-brand-primary sm:text-4xl">
            <span className="marker-highlight px-2">{title}</span>
          </h2>
          {desc && (
            <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
          )}
          {side && (
            <div className="pointer-events-none absolute -top-12 -right-3 w-24 sm:-right-10 sm:w-32">
              {side}
            </div>
          )}
        </div>
      </Reveal>
      {children && (
        <div className="relative z-10 mx-auto mt-10 max-w-5xl">{children}</div>
      )}
    </section>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ビルド時の静的生成でDBに到達できなくてもLP自体は生成できるようにする
  // （DBが空・一時的に不通でも地図と新着が空になるだけ。ISRで後から復帰）
  const [counts, latest] = await Promise.all([
    getCountryCounts().catch(() => ({}) as Record<string, number>),
    getLatestListings(8).catch(() => []),
  ]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* 1. ヒーロー（白波模様） */}
        <section className="bg-waves relative overflow-hidden px-4 pt-12 pb-20">
          <FlaskIcon className="animate-floaty absolute top-10 left-[6%] w-10 opacity-60" />
          <PlaneIcon className="animate-floaty-slow absolute top-24 right-[8%] w-12 opacity-60 sm:right-[20%]" />
          <PaperIcon className="animate-floaty absolute bottom-8 left-[12%] w-9 opacity-50" />
          <TestTubeIcon className="animate-floaty-slow absolute top-1/2 left-[40%] w-8 opacity-40" />

          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:gap-4">
            <Reveal className="flex-1 text-center md:text-left">
              <h1 className="mb-4 text-3xl leading-snug font-black [word-break:keep-all] sm:text-4xl lg:text-5xl">
                <span className="block">{t("lp.hero.title1")}</span>
                <span className="block">{t("lp.hero.title2")}</span>
              </h1>
              <p className="mb-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t("lp.hero.sub")}
              </p>
              <div className="mb-8 flex items-start justify-center gap-2 md:justify-start">
                <ShieldIcon className="w-9 shrink-0" />
                <p className="max-w-md text-left text-sm leading-relaxed text-gray-700">
                  {t("lp.hero.trust")}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                <Link
                  href="/jobs"
                  className="rounded-full bg-brand-primary px-8 py-3 text-center font-bold text-white shadow-md transition hover:brightness-105"
                >
                  {t("lp.hero.ctaFind")}
                </Link>
                <Link
                  href="/post"
                  className="rounded-full border-2 border-brand-primary bg-white px-8 py-3 text-center font-bold text-brand-primary transition hover:bg-brand-tab"
                >
                  {t("lp.hero.ctaPost")}
                </Link>
              </div>
            </Reveal>
            <Reveal delay={150} className="w-full max-w-sm flex-1 md:max-w-md">
              <HeroIllustration className="w-full" />
            </Reveal>
          </div>
        </section>

        {/* 2. 世界地図（#c9e265） */}
        <PatternSection
          bgClass="bg-brand-card"
          word="GLOBAL"
          title={t("lp.map.heading")}
          desc={t("lp.map.desc")}
          side={<ResearcherGlobal className="w-full" />}
          decorations={
            <MoleculeIcon className="absolute -top-5 -left-4 w-12 sm:-left-8" />
          }
        >
          <Reveal delay={150}>
            <WorldMap counts={counts} />
          </Reveal>
          {Object.keys(counts).length === 0 && (
            <p className="mx-auto mt-6 max-w-xl rounded-full bg-white/70 px-6 py-2 text-center text-sm text-gray-700">
              {t("lp.map.empty")}
            </p>
          )}
        </PatternSection>

        {/* 3. 特徴（白波模様） */}
        <PatternSection
          bgClass="bg-waves"
          word="FEATURES"
          title={t("lp.features.heading")}
          desc={t("lp.features.desc")}
          side={<ResearcherWave className="w-full" />}
          decorations={
            <SparkleIcon className="absolute -bottom-3 -left-3 w-8" />
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["f1", ResearcherBridge],
                ["f2", ResearcherForm],
                ["f3", ResearcherGlobal],
                ["f4", ResearcherClean],
              ] as const
            ).map(([key, Illust], i) => (
              <Reveal key={key} delay={i * 100}>
                <div className="h-full rounded-2xl bg-white p-6 text-center shadow-md">
                  <Illust className="mx-auto mb-4 w-32" />
                  <h3 className="mb-2 text-lg font-bold [word-break:keep-all] text-brand-primary">
                    {t(`lp.features.${key}Title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {t(`lp.features.${key}Body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </PatternSection>

        {/* 4. 使い方（#eef6d6） */}
        <PatternSection
          bgClass="bg-brand-tab"
          word="HOW TO USE"
          title={t("lp.howto.heading")}
          desc={t("lp.howto.desc")}
          side={<MicroscopeIcon className="w-full" />}
          decorations={
            <FlaskIcon className="absolute -bottom-4 -left-3 w-10" />
          }
        >
          {/* 登録不要・完全無料のリボン風バッジ */}
          <Reveal className="mb-10 text-center">
            <span className="relative inline-block -rotate-2">
              <SparkleIcon className="animate-floaty absolute -top-5 -left-8 w-8" />
              <span className="inline-block rounded-full border-[3px] border-[#2b2b2b] bg-brand-accent px-6 py-3 text-lg font-black text-white shadow-md sm:px-10 sm:text-2xl">
                {t("lp.howto.badge")}
              </span>
              <SparkleIcon className="animate-floaty-slow absolute -right-7 -bottom-4 w-7" />
            </span>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(["seek", "post"] as const).map((side, i) => {
              const HeadIcon = HOWTO_HEAD_ICONS[side];
              return (
                <Reveal key={side} delay={i * 150}>
                  <div className="h-full rounded-2xl bg-white p-6 shadow-md">
                    <h3 className="mb-6 flex items-center justify-center gap-3 text-xl font-black sm:text-2xl">
                      <HeadIcon className="w-10 shrink-0" />
                      {t(`lp.howto.${side}Title`)}
                    </h3>
                    <ol>
                      {([1, 2, 3] as const).map((n) => {
                        const StepIcon = HOWTO_STEPS[side][n - 1];
                        return (
                          <li key={n}>
                            <div className="flex items-center gap-4">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-base font-black text-white">
                                {n}
                              </span>
                              <StepIcon className="w-16 shrink-0" />
                              <span className="text-sm font-medium sm:text-base">
                                {t(`lp.howto.${side}S${n}`)}
                              </span>
                            </div>
                            {n < 3 && (
                              <div className="my-1 ml-[1.05rem] flex h-7 flex-col items-center justify-center">
                                <div
                                  aria-hidden="true"
                                  className="h-full border-l-[3px] border-dashed border-brand-primary/60"
                                />
                                <span
                                  aria-hidden="true"
                                  className="-mt-1 text-xs leading-none text-brand-primary"
                                >
                                  ▼
                                </span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </PatternSection>

        {/* 5. 新着求人（#deeaea・カルーセル） */}
        <PatternSection
          bgClass="bg-brand-bg"
          word="JOBS"
          title={t("lp.jobs.heading")}
          desc={t("lp.jobs.desc")}
          side={<ResearcherClean className="w-full" />}
          decorations={
            <PlaneIcon className="absolute -top-5 -left-5 w-10" />
          }
        >
          {latest.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-md">
                <p className="mb-4 text-sm text-gray-600">{t("lp.jobs.empty")}</p>
                <Link
                  href="/post"
                  className="inline-block rounded-full border-2 border-brand-primary bg-white px-8 py-2.5 font-bold text-brand-primary transition hover:bg-brand-tab"
                >
                  {t("lp.hero.ctaPost")}
                </Link>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={150}>
              <JobsCarousel listings={latest} />
            </Reveal>
          )}
          <Reveal className="mt-8 text-center">
            <Link
              href="/jobs"
              className="inline-block rounded-full bg-brand-primary px-8 py-3 font-bold text-white shadow-md transition hover:brightness-105"
            >
              {t("lp.jobs.viewAll")} →
            </Link>
          </Reveal>
        </PatternSection>

        {/* 6. 外部求人サイト一覧（白波模様・その場に並べる） */}
        <PatternSection
          bgClass="bg-waves"
          word="LINKS"
          title={t("lp.links.heading")}
          desc={t("lp.links.desc")}
          side={<BuildingIcon className="w-full" />}
        >
          <Reveal delay={100}>
            <JobSitesPreview />
          </Reveal>
          <p className="mt-6 text-center text-xs text-gray-500">
            {t("lp.links.note")}
          </p>
        </PatternSection>
      </main>
    </div>
  );
}
