import { createServiceClient } from "./supabase/server";
import {
  EMPLOYMENT_TYPE_CODES,
  FIELD_CODES,
  JOB_TYPE_CODES,
  ORGANIZATION_TYPE_CODES,
} from "./filters";
import { PREFECTURE_CODES } from "./prefectures";
import { expandSynonyms } from "./searchSynonyms";
import { translateQuery } from "./translate";
import { getListingIdsForFields } from "./researchFields";
import { PUBLIC_LISTING_COLUMNS, type Listing, type PublicListing } from "./types";

export const PAGE_SIZE = 20;

// 自由文検索の対象カラム（各言語カラムに原文がミラーされている）
const SEARCH_TEXT_COLUMNS = [
  "title_ja",
  "title_en",
  "title_zh",
  "title_ko",
  "summary_ja",
  "summary_en",
  "summary_zh",
  "summary_ko",
] as const;

// PostgREST の .or() は値中の , ( ) や LIKE のワイルドカード % _、
// バックスラッシュで構文が壊れるため、これらを空白に置換してから使う。
function sanitizeForOr(term: string): string {
  return term.replace(/[,()%_\\]/g, " ").trim();
}

export type SearchFilters = {
  field?: string;
  jobType?: string;
  employmentType?: string;
  organizationType?: string;
  country?: string;
  prefecture?: string;
  deadlineWithinDays?: number;
  keyword?: string;
  // 研究分野マスターの細目 id。フィルタ内は OR（いずれかの細目に一致）、
  // 他ファセットとは AND。大分類での絞り込みは UI 側で配下細目に展開して渡す。
  researchFieldIds?: string[];
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

  // 研究分野（細目）フィルタ：該当する求人 id の許可リストに解決する。
  // フィルタ内は OR（いずれかの細目に一致）、他ファセットとは AND。
  // getListingIdsForFields は id を重複排除（distinct）して返すため、
  // 複数細目に一致した求人が重複行になることはない。
  const rfIds = filters.researchFieldIds ?? [];
  let fieldAllowlist: string[] | null = null;
  if (rfIds.length > 0) {
    fieldAllowlist = await getListingIdsForFields(rfIds);
    if (fieldAllowlist.length === 0) return { items: [], total: 0 };
  }

  let query = supabase
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .gte("deadline", todayUtc());

  // 研究分野フィルタ：該当求人 id に限定（他ファセットとは AND）
  if (fieldAllowlist) query = query.in("id", fieldAllowlist);

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

  // 自由文検索：原文キーワードを日英に翻訳し、全翻訳カラムを横断して部分一致検索する。
  // これにより「英語で検索した人が日本語求人の英訳カラムにも当たる」など、
  // 言語をまたいだ取りこぼしを減らす（v1.2）。
  const rawKeyword = filters.keyword?.trim() ?? "";
  if (rawKeyword) {
    // 検索語集合（サニタイズ後の重複・原文と同一の訳は自動的に除外される）
    const terms = new Set<string>();
    const addTerm = (t: string | null | undefined) => {
      if (!t) return;
      const s = sanitizeForOr(t);
      if (s) terms.add(s);
    };
    addTerm(rawKeyword);

    // 翻訳スキップ条件：2文字未満・100文字超はDeepLを呼ばず原文のみで検索
    // （ボット・無意味クエリでの無料枠消費を防ぐ）
    if (rawKeyword.length >= 2 && rawKeyword.length <= 100) {
      // translateQuery は失敗時 null を返すのみで例外は投げない
      const [ja, en] = await Promise.all([
        translateQuery(rawKeyword, "ja"),
        translateQuery(rawKeyword, "en"),
      ]);
      addTerm(ja);
      addTerm(en);
    }

    // 訳語割れ対策：原文・日訳・英訳のいずれかが同義語グループに一致したら、
    // そのグループの全語を検索語に加える（例: 「박사후연구원」→「ポスドク」）。
    for (const word of expandSynonyms(terms)) {
      addTerm(word);
    }

    // .or() の肥大化を防ぐため検索語は上限15語に制限する
    const MAX_TERMS = 15;
    const searchTerms = [...terms].slice(0, MAX_TERMS);

    const orParts: string[] = [];
    for (const term of searchTerms) {
      for (const col of SEARCH_TEXT_COLUMNS) {
        orParts.push(`${col}.ilike.*${term}*`);
      }
    }
    if (orParts.length > 0) {
      query = query.or(orParts.join(","));
    }

    // 一時デバッグ（DEBUG_SEARCH=1 のときだけ出力）：
    // この検索がどの経路を通ったかを判別する。現状このリポジトリに
    // ベクトル/RPC 経路は無く、自由文検索は常に ILIKE 経路を通る。
    if (process.env.DEBUG_SEARCH === "1") {
      console.error(
        `[searchListings] path=ILIKE keyword=${JSON.stringify(rawKeyword)} ` +
          `terms=${JSON.stringify(searchTerms)} orConditions=${orParts.length}`
      );
    }
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
