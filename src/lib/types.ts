import type {
  EmploymentTypeCode,
  JobTypeCode,
  ListingStatus,
  Locale,
  OrganizationTypeCode,
} from "./filters";

// listings テーブルの1行（supabase/schema.sql と対応）
export type Listing = {
  id: string;
  title: string;
  summary: string;
  // 自動翻訳カラム（v1.1 §3。未翻訳は null）
  title_ja: string | null;
  title_en: string | null;
  title_zh: string | null;
  title_ko: string | null;
  summary_ja: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  summary_ko: string | null;
  job_type: JobTypeCode;
  employment_type: EmploymentTypeCode;
  organization_type: OrganizationTypeCode;
  country: string; // ISO 3166-1 alpha-2
  prefecture: string | null;
  deadline: string; // YYYY-MM-DD
  external_url: string;
  post_language: Locale;
  poster_email: string;
  status: ListingStatus;
  edit_token: string;
  report_count: number;
  link_check_failures: number;
  last_link_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

// 一覧・詳細ページでクライアントに渡してよいフィールドのみ
export type PublicListing = Omit<
  Listing,
  | "poster_email"
  | "edit_token"
  | "report_count"
  | "link_check_failures"
  | "last_link_checked_at"
>;

// カードのバッジ表示用の大分類（研究分野マスターの大分類、ローカライズ名つき）
export type ListingCategory = {
  id: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
  name_ko: string;
};

// 求人＋その求人が属する研究分野の大分類（重複排除・sort_order 昇順、最大11）
export type PublicListingWithCategories = PublicListing & {
  categories: ListingCategory[];
};

export const PUBLIC_LISTING_COLUMNS =
  "id, title, summary, title_ja, title_en, title_zh, title_ko, summary_ja, summary_en, summary_zh, summary_ko, job_type, employment_type, organization_type, country, prefecture, deadline, external_url, post_language, status, created_at, updated_at";
