import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import LandingPrefetch from "@/components/LandingPrefetch";
import ButtonMotion from "@/components/ButtonMotion";
import FeatureCards from "@/components/FeatureCards";
import HowtoCards from "@/components/HowtoCards";
import JobSitesPreview from "@/components/JobSitesPreview";
import JobsCarousel from "@/components/JobsCarousel";
import RegionMap from "@/components/RegionMap";
import Reveal from "@/components/Reveal";
import WorldGlobe from "@/components/WorldGlobe";
import { Link } from "@/i18n/navigation";
import { getCountryCounts, getLatestListings } from "@/lib/listings";

// 求人数・新着は10分ごとに再生成（毎リクエストのDBアクセスを避ける）
export const revalidate = 600;

// アカデミック・ミニマルのセクション型：
// 特大英字のウォーターマーク（薄色）→ 見出し → 説明 → コンテンツ
function PatternSection({
  bgClass,
  dark = false,
  align = "left",
  word,
  title,
  desc,
  children,
  paddingClass = "pt-11 pb-20",
  contentClass = "mt-12",
}: {
  bgClass: string;
  dark?: boolean;
  align?: "left" | "right";
  word: string;
  title: string;
  desc?: React.ReactNode;
  children?: React.ReactNode;
  // 縦方向の余白を呼び出し側で上書きするためのフック（howto専用の圧縮に使用）
  paddingClass?: string;
  contentClass?: string;
}) {
  return (
    <section className={`relative overflow-hidden px-4 ${paddingClass} ${bgClass}`}>
      {/* ネイビー地のときは白系の半透明円を左上・右下に置いて奥行きを出す */}
      {dark && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/[0.08]"
          />
        </>
      )}
      {/* ウォーターマーク英字：左右交互に置き、画面端で切って紙面的なリズムを作る */}
      <div
        aria-hidden="true"
        className={`pointer-events-none -mb-[5vw] text-[14vw] leading-none font-black tracking-tight whitespace-nowrap select-none sm:-mb-[3.5vw] sm:text-[10vw] ${
          dark ? "text-watermark-dark" : "text-watermark"
        } ${align === "right" ? "-mr-[4vw] text-right" : "-ml-[4vw] text-left"}`}
      >
        {word}
      </div>
      <Reveal className="relative z-10 text-center">
        <h2
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${
            dark ? "text-white" : "text-brand-primary"
          }`}
        >
          <span className={dark ? "" : "marker-highlight px-2"}>{title}</span>
        </h2>
        {desc && (
          <p
            className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed ${
              dark ? "text-white/70" : "text-gray-600"
            }`}
          >
            {desc}
          </p>
        )}
      </Reveal>
      {children && (
        <div className={`relative z-10 mx-auto ${contentClass} max-w-5xl`}>
          {children}
        </div>
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
  const [counts, latest] = await Promise.all([
    getCountryCounts(),
    getLatestListings(8),
  ]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />
      {/* スクロールしないと現れる下部 CTA でも即遷移するよう /jobs・/post を先読み */}
      <LandingPrefetch />
      {/* LP内の .btn-fx ボタンを出現時に一度だけ揺らす */}
      <ButtonMotion />
      <main className="flex-1">
        {/* 1. ヒーロー（白） */}
        <section className="bg-waves relative overflow-hidden px-4 pt-20 pb-24">
          <div
            aria-hidden="true"
            className="text-watermark pointer-events-none absolute top-6 -left-[3vw] text-[14vw] leading-none font-black tracking-tight whitespace-nowrap select-none sm:-top-3 sm:text-[10vw]"
          >
            NEXT STAGE
          </div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="mb-6 text-xs font-bold tracking-[0.35em] text-gray-400 uppercase">
                Academia Jobs
              </p>
              <h1 className="mb-6 text-3xl leading-snug font-bold tracking-tight text-brand-primary [word-break:keep-all] sm:text-4xl lg:text-5xl">
                <span className="block">{t("lp.hero.title1")}</span>
                <span className="block">
                  <span className="marker-highlight px-1">{t("lp.hero.title2")}</span>
                </span>
              </h1>
              <p className="mb-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {locale === "ja" ? (
                  <>
                    {t("lp.hero.subA")}
                    <br />
                    {t("lp.hero.subB")}
                  </>
                ) : (
                  t("lp.hero.sub")
                )}
              </p>
              <p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-gray-500">
                {locale === "ja" ? (
                  <>
                    {t("lp.hero.trustA")}
                    <br />
                    {t("lp.hero.trustB")}
                    <br />
                    {t("lp.hero.trustC")}
                  </>
                ) : (
                  t("lp.hero.trust")
                )}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/jobs"
                  prefetch
                  className="btn-fx rounded-md bg-brand-primary px-8 py-3 text-center font-bold text-white shadow-sm transition hover:brightness-90"
                >
                  {t("lp.hero.ctaFind")} →
                </Link>
                <Link
                  href="/post"
                  prefetch
                  className="btn-fx rounded-md bg-brand-green px-8 py-3 text-center font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  {t("lp.hero.ctaPost")} →
                </Link>
              </div>
              <p className="mt-4 text-center text-xs text-gray-400">
                {t("lp.hero.ctaNote")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 2. 世界地図 */}
        <PatternSection
          bgClass="bg-[#eef1f6]"
          align="left"
          word="GLOBAL"
          title={t("lp.map.heading")}
          desc={
            locale === "ja" ? (
              <>
                {t("lp.map.descA")}
                <br className="sm:hidden" />
                {t("lp.map.descB")}
              </>
            ) : (
              t("lp.map.desc")
            )
          }
        >
          <Reveal delay={150}>
            <WorldGlobe counts={counts} />
          </Reveal>
          {Object.keys(counts).length === 0 && (
            <p className="mx-auto mt-6 max-w-xl text-center text-sm text-gray-500">
              {t("lp.map.empty")}
            </p>
          )}
        </PatternSection>

        {/* 3. 新着求人（ネイビー） */}
        <PatternSection
          bgClass="bg-brand-primary"
          dark
          align="right"
          word="JOBS"
          title={t("lp.jobs.heading")}
          desc={t("lp.jobs.desc")}
        >
          {latest.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-3xl rounded-lg border border-white/15 bg-white/5 p-8 text-center">
                <p className="mb-5 text-sm text-white/80">{t("lp.jobs.empty")}</p>
                <Link
                  href="/post"
                  prefetch
                  className="btn-fx inline-block rounded-md bg-brand-point px-8 py-2.5 font-bold text-brand-primary transition hover:brightness-95"
                >
                  {t("lp.hero.ctaPost")}
                </Link>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={150}>
              <JobsCarousel
                listings={latest}
                maps={Object.fromEntries(
                  latest.map((l) => [
                    l.id,
                    <RegionMap
                      key={l.id}
                      country={l.country}
                      prefecture={l.prefecture}
                      className="absolute inset-0 h-full w-full"
                    />,
                  ])
                )}
              />
            </Reveal>
          )}
          <Reveal className="mt-10 text-center">
            <Link
              href="/jobs"
              prefetch
              className="btn-fx inline-block rounded-md bg-brand-point px-8 py-3 font-bold text-brand-primary transition hover:brightness-95"
            >
              {t("lp.jobs.viewAll")} →
            </Link>
          </Reveal>
        </PatternSection>

        {/* 4. 特徴（白） */}
        <PatternSection
          bgClass="bg-waves"
          align="left"
          word="FEATURES"
          title={t("lp.features.heading")}
          desc={
            locale === "ja" ? (
              <>
                {t("lp.features.descA")}
                <br className="sm:hidden" />
                {t("lp.features.descB")}
              </>
            ) : (
              t("lp.features.desc")
            )
          }
        >
          <FeatureCards />
        </PatternSection>

        {/* 5. 使い方（ネイビー背景） */}
        <PatternSection
          bgClass="bg-brand-primary"
          dark
          align="right"
          word="HOW TO USE"
          title={t("lp.howto.heading")}
          desc={t("lp.howto.desc")}
          paddingClass="pt-8 pb-[60px]"
          contentClass="mt-9"
        >
          <Reveal className="mb-[30px] text-center">
            <span className="inline-block rounded-full bg-brand-point px-6 py-[6px] text-sm font-bold text-brand-primary">
              {t("lp.howto.badge")}
            </span>
          </Reveal>
          <HowtoCards />
        </PatternSection>

        {/* 6. 外部求人サイト一覧（白） */}
        <PatternSection
          bgClass="bg-waves"
          align="left"
          word="LINKS"
          title={t("lp.links.heading")}
          desc={
            locale === "ja" ? (
              <>
                {t("lp.links.descA")}
                <br className="sm:hidden" />
                {t("lp.links.descB")}
              </>
            ) : (
              t("lp.links.desc")
            )
          }
        >
          <Reveal delay={100}>
            <JobSitesPreview />
          </Reveal>
          <p className="mt-8 text-center text-xs text-gray-400">
            {t("lp.links.note")}
          </p>
        </PatternSection>
      </main>
    </div>
  );
}
