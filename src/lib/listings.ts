import { createServiceClient } from "./supabase/server";
import {
  EMPLOYMENT_TYPE_CODES,
  FIELD_CODES,
  JOB_TYPE_CODES,
  ORGANIZATION_TYPE_CODES,
} from "./filters";
import { PREFECTURE_CODES } from "./prefectures";
import { PUBLIC_LISTING_COLUMNS, type Listing, type PublicListing } from "./types";

export const PAGE_SIZE = 20;

export type SearchFilters = {
  field?: string;
  jobType?: string;
  employmentType?: string;
  organizationType?: string;
  country?: string;
  prefecture?: string;
  deadlineWithinDays?: number;
  keyword?: string;
  page?: number;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// 公開ルール（§6）：status=published かつ締切前のみ
export async function searchListings(
  filters: SearchFilters
): Promise<{ items: PublicListing[]; total: number }> {
  const supabase = createServiceClient();

  let query = supabase
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .gte("deadline", todayUtc());

  // 不正なコードはエラーにせず無視する（URLを直接書き換えられた場合など）
  if (filters.field && (FIELD_CODES as readonly string[]).includes(filters.field)) {
    query = query.eq("field", filters.field);
  }
  if (filters.jobType && (JOB_TYPE_CODES as readonly string[]).includes(filters.jobType)) {
    query = query.eq("job_type", filters.jobType);
  }
  if (
    filters.employmentType &&
    (EMPLOYMENT_TYPE_CODES as readonly string[]).includes(filters.employmentType)
  ) {
    query = query.eq("employment_type", filters.employmentType);
  }
  if (
    filters.organizationType &&
    (ORGANIZATION_TYPE_CODES as readonly string[]).includes(filters.organizationType)
  ) {
    query = query.eq("organization_type", filters.organizationType);
  }
  if (filters.country && /^[A-Z]{2}$/.test(filters.country)) {
    query = query.eq("country", filters.country);
    if (
      filters.country === "JP" &&
      filters.prefecture &&
      PREFECTURE_CODES.includes(filters.prefecture)
    ) {
      query = query.eq("prefecture", filters.prefecture);
    }
  }
  if (filters.deadlineWithinDays && filters.deadlineWithinDays > 0) {
    const until = new Date(Date.now() + filters.deadlineWithinDays * 86400000)
      .toISOString()
      .slice(0, 10);
    query = query.lte("deadline", until);
  }

  // PostgREST の or() 構文を壊す文字は除去してから部分一致検索
  // 原文に加えて日英の翻訳カラムも対象にする（英語求人を日本語キーワードで見つけられる）
  const keyword = filters.keyword?.replace(/[,()%_\\]/g, " ").trim();
  if (keyword) {
    const targets = [
      "title",
      "summary",
      "title_ja",
      "title_en",
      "summary_ja",
      "summary_en",
    ];
    query = query.or(targets.map((c) => `${c}.ilike.*${keyword}*`).join(","));
  }

  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("deadline", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    throw new Error(`求人の検索に失敗しました: ${error.message}`);
  }
  return { items: (data ?? []) as unknown as PublicListing[], total: count ?? 0 };
}

// LP「新着求人」用
export async function getLatestListings(limit: number): Promise<PublicListing[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS)
    .eq("status", "published")
    .gte("deadline", todayUtc())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(`新着求人の取得に失敗しました: ${error.message}`);
  }
  return (data ?? []) as unknown as PublicListing[];
}

// LP世界地図用：公開中求人の国別件数
export async function getCountryCounts(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("country")
    .eq("status", "published")
    .gte("deadline", todayUtc())
    .limit(1000);
  if (error) {
    throw new Error(`国別件数の取得に失敗しました: ${error.message}`);
  }
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { country: string }[]) {
    counts[row.country] = (counts[row.country] ?? 0) + 1;
  }
  return counts;
}

// 管理画面用。呼び出し側で必ず管理者認証を確認すること
export async function getAllListingsForAdmin(): Promise<Listing[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("report_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    throw new Error(`求人一覧の取得に失敗しました: ${error.message}`);
  }
  return (data ?? []) as Listing[];
}

// 投稿者の管理ページ用。edit_token を知っている本人のみ到達できる
export async function getListingByToken(token: string): Promise<Listing | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("edit_token", token)
    .maybeSingle();
  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`);
  }
  return (data as Listing) ?? null;
}

export async function getPublishedListing(
  id: string
): Promise<PublicListing | null> {
  // UUID以外はDBに問い合わせない
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .gte("deadline", todayUtc())
    .maybeSingle();

  if (error) {
    throw new Error(`求人の取得に失敗しました: ${error.message}`);
  }
  return (data as unknown as PublicListing) ?? null;
}
