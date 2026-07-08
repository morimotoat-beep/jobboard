import type { Locale } from "./filters";

// 外部求人サイトのリンク集（v1.1 §4）
// リンクのみ。各サイトの求人情報（タイトル・締切等）の取り込み・転載は行わない。
export type JobSite = {
  name: string;
  url: string;
  desc: Record<Locale, string>;
};

export type JobSiteCategory = {
  key: "domestic" | "intl_public" | "intl_commercial" | "field";
  sites: JobSite[];
};

export const JOB_SITE_CATEGORIES: JobSiteCategory[] = [
  {
    key: "domestic",
    sites: [
      {
        name: "JREC-IN Portal",
        url: "https://jrecin.jst.go.jp/",
        desc: {
          ja: "国内最大の研究者向け求人ポータル（JST運営）。国内公募を探すならまずここ。",
          en: "Japan's largest research job portal, run by JST. The first stop for positions in Japan.",
          zh: "日本最大的研究人员求职门户（JST运营）。",
          ko: "일본 최대 연구자 채용 포털(JST 운영).",
        },
      },
    ],
  },
  {
    key: "intl_public",
    sites: [
      {
        name: "EURAXESS",
        url: "https://euraxess.ec.europa.eu/jobs/search",
        desc: {
          ja: "EU公式の研究者求人・フェローシップ情報。欧州ポスドク探しの定番。",
          en: "The EU's official portal for research jobs and fellowships across Europe.",
          zh: "欧盟官方的研究职位与奖学金信息门户。",
          ko: "EU 공식 연구자 채용·펠로우십 포털.",
        },
      },
      {
        name: "Science Careers",
        url: "https://jobs.sciencecareers.org/",
        desc: {
          ja: "非営利学会AAAS（Science誌）運営の求人サイト。米国を中心に幅広い分野をカバー。",
          en: "Job board run by AAAS (publisher of Science), a non-profit society. Broad coverage centered on the US.",
          zh: "非营利学会AAAS（《科学》杂志）运营的招聘网站。",
          ko: "비영리 학회 AAAS(Science誌)가 운영하는 채용 사이트.",
        },
      },
      {
        name: "AcademicJobsOnline",
        url: "https://academicjobsonline.org/",
        desc: {
          ja: "大学運営の非営利な公募システム。無料で、物理・数学系の教員公募が豊富。",
          en: "A non-profit, university-run application system. Free, and strong in physics and math.",
          zh: "由大学运营的非营利招聘系统，免费，物理·数学类职位丰富。",
          ko: "대학이 운영하는 비영리 공모 시스템. 무료이며 물리·수학 분야가 강함.",
        },
      },
    ],
  },
  {
    key: "intl_commercial",
    sites: [
      {
        name: "Nature Careers",
        url: "https://www.nature.com/naturecareers/",
        desc: {
          ja: "Nature誌（Springer Nature）が運営する国際的な研究職求人サイト。世界のポスドク・PI公募が集まる。",
          en: "International research jobs from Springer Nature, publisher of Nature.",
          zh: "《自然》杂志（Springer Nature）运营的国际科研职位网站。",
          ko: "Nature(Springer Nature)가 운영하는 국제 연구직 채용 사이트.",
        },
      },
      {
        name: "Times Higher Education Jobs",
        url: "https://www.timeshighereducation.com/unijobs/",
        desc: {
          ja: "英THE運営。世界の大学教員・研究職・大学職員の求人。",
          en: "Global university jobs from Times Higher Education.",
          zh: "英国THE运营的全球高校职位网站。",
          ko: "THE가 운영하는 글로벌 대학 채용 사이트.",
        },
      },
      {
        name: "jobs.ac.uk",
        url: "https://www.jobs.ac.uk/",
        desc: {
          ja: "英国・欧州を中心とした大学・研究機関の求人サイト。",
          en: "Academic jobs in the UK and Europe.",
          zh: "以英国和欧洲为主的高校招聘网站。",
          ko: "영국·유럽 중심의 대학 채용 사이트.",
        },
      },
      {
        name: "HigherEdJobs",
        url: "https://www.higheredjobs.com/",
        desc: {
          ja: "米国の大学求人を幅広くカバーする老舗サイト。",
          en: "Broad coverage of US higher-education jobs.",
          zh: "广泛覆盖美国高校职位的老牌网站。",
          ko: "미국 대학 채용을 폭넓게 다루는 사이트.",
        },
      },
      {
        name: "Academic Positions",
        url: "https://academicpositions.com/",
        desc: {
          ja: "欧州中心の国際アカデミア求人サイト。英語UI で探しやすい。",
          en: "International academic jobs, strongest in Europe.",
          zh: "以欧洲为主的国际学术职位网站。",
          ko: "유럽 중심의 국제 아카데미아 채용 사이트.",
        },
      },
    ],
  },
  {
    key: "field",
    sites: [
      {
        name: "MathJobs.org",
        url: "https://www.mathjobs.org/",
        desc: {
          ja: "アメリカ数学会（AMS）運営。数学分野の応募はここが標準。",
          en: "Run by the AMS; the standard application route in mathematics.",
          zh: "美国数学会（AMS）运营，数学领域的标准平台。",
          ko: "미국수학회(AMS) 운영, 수학 분야 표준 플랫폼.",
        },
      },
      {
        name: "AAS Job Register",
        url: "https://jobregister.aas.org/",
        desc: {
          ja: "アメリカ天文学会の求人掲示板。天文・宇宙物理分野の定番。",
          en: "The American Astronomical Society's job register for astronomy and astrophysics.",
          zh: "美国天文学会的职位公告板。",
          ko: "미국천문학회 채용 게시판.",
        },
      },
    ],
  },
];
