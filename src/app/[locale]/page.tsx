import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import JobSitesPreview from "@/components/JobSitesPreview";
import JobsCarousel from "@/components/JobsCarousel";
import Reveal from "@/components/Reveal";
import WorldMap from "@/components/WorldMap";
import { Link } from "@/i18n/navigation";
import { getCountryCounts, getLatestListings } from "@/lib/listings";

// 求人数・新着は10分ごとに再生成（毎リクエストのDBアクセスを避ける）
export const revalidate = 600;

// アカデミック・ミニマルのセクション型：
// 特大英字のウォーターマーク（薄色）→ 見出し → 説明 → コンテンツ
function PatternSection({
  bgClass,
  dark = false,
  word,
  title,
  desc,
  children,
}: {
  bgClass: string;
  dark?: boolean;
  word: string;
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden px-4 py-20 ${bgClass}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none -mb-[4.5vw] text-center text-[13vw] leading-none font-black tracking-tight whitespace-nowrap select-none sm:-mb-[3vw] sm:text-[9vw] ${
          dark ? "text-watermark-dark" : "text-watermark"
        }`}
      >
        {word}
      </div>
      <Reveal className="relative z-10 text-center">
        <h2
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${
            dark ? "text-white" : "text-brand-primary"
          }`}
        >
          {title}
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
        <div className="relative z-10 mx-auto mt-12 max-w-5xl">{children}</div>
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
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* 1. ヒーロー（白） */}
        <section className="bg-white px-4 pt-20 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="mb-6 text-xs font-bold tracking-[0.35em] text-gray-400 uppercase">
                Academia Note Jobs
              </p>
              <h1 className="mb-6 text-3xl leading-snug font-bold tracking-tight text-brand-primary [word-break:keep-all] sm:text-4xl lg:text-5xl">
                <span className="block">{t("lp.hero.title1")}</span>
                <span className="block">{t("lp.hero.title2")}</span>
              </h1>
              <p className="mb-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t("lp.hero.sub")}
              </p>
              <p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-gray-500">
                {t("lp.hero.trust")}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/jobs"
                  className="rounded-md bg-brand-primary px-8 py-3 text-center font-bold text-white transition hover:opacity-90"
                >
                  {t("lp.hero.ctaFind")}
                </Link>
                <Link
                  href="/post"
                  className="rounded-md border border-brand-primary bg-white px-8 py-3 text-center font-bold text-brand-primary transition hover:bg-brand-tab"
                >
                  {t("lp.hero.ctaPost")}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. 世界地図 */}
        <PatternSection
          bgClass="bg-[#eef1f6]"
          word="GLOBAL"
          title={t("lp.map.heading")}
          desc={t("lp.map.desc")}
        >
          <Reveal delay={150}>
            <WorldMap counts={counts} />
          </Reveal>
          {Object.keys(counts).length === 0 && (
            <p className="mx-auto mt-6 max-w-xl text-center text-sm text-gray-500">
              {t("lp.map.empty")}
            </p>
          )}
        </PatternSection>

        {/* 3. 特徴（白） */}
        <PatternSection
          bgClass="bg-white"
          word="FEATURES"
          title={t("lp.features.heading")}
          desc={t("lp.features.desc")}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(["f1", "f2", "f3", "f4"] as const).map((key, i) => (
              <Reveal key={key} delay={i * 100}>
                <div className="h-full rounded-lg border border-gray-200 bg-white p-7 text-left">
                  <p className="mb-4 text-sm font-bold tracking-widest text-gray-400">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-3 text-base font-bold [word-break:keep-all] text-brand-primary">
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

        {/* 4. 使い方 */}
        <PatternSection
          bgClass="bg-[#eef1f6]"
          word="HOW TO USE"
          title={t("lp.howto.heading")}
          desc={t("lp.howto.desc")}
        >
          <Reveal className="mb-10 text-center">
            <span className="inline-block rounded-full border border-brand-primary/30 bg-white px-5 py-1.5 text-sm font-bold text-brand-primary">
              {t("lp.howto.badge")}
            </span>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(["seek", "post"] as const).map((side, i) => (
              <Reveal key={side} delay={i * 150}>
                <div className="h-full rounded-lg border border-gray-200 bg-white p-8">
                  <h3 className="mb-8 text-center text-lg font-bold text-brand-primary">
                    {t(`lp.howto.${side}Title`)}
                  </h3>
                  <ol>
                    {([1, 2, 3] as const).map((n) => (
                      <li key={n}>
                        <div className="flex items-center gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-primary/40 text-sm font-bold text-brand-primary">
                            {n}
                          </span>
                          <span className="text-sm leading-relaxed font-medium sm:text-base">
                            {t(`lp.howto.${side}S${n}`)}
                          </span>
                        </div>
                        {n < 3 && (
                          <div
                            aria-hidden="true"
                            className="my-1 ml-4 h-6 border-l border-gray-300"
                          />
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>
        </PatternSection>

        {/* 5. 新着求人（ネイビー） */}
        <PatternSection
          bgClass="bg-brand-primary"
          dark
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
                  className="inline-block rounded-md bg-white px-8 py-2.5 font-bold text-brand-primary transition hover:bg-brand-tab"
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
          <Reveal className="mt-10 text-center">
            <Link
              href="/jobs"
              className="inline-block rounded-md bg-white px-8 py-3 font-bold text-brand-primary transition hover:bg-brand-tab"
            >
              {t("lp.jobs.viewAll")} →
            </Link>
          </Reveal>
        </PatternSection>

        {/* 6. 外部求人サイト一覧（白） */}
        <PatternSection
          bgClass="bg-white"
          word="LINKS"
          title={t("lp.links.heading")}
          desc={t("lp.links.desc")}
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
