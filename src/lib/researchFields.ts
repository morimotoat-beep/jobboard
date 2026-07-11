import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "./supabase/server";
import type { Locale } from "./filters";
import type { ListingCategory } from "./types";

// JREC-IN 準拠の研究分野マスター（大分類11 / 細目306、日英中韓）
// 求人は細目(field_id)の配列だけを listing_research_fields に持つ。

export type ResearchCategory = {
  id: string;
  sort_order: number;
  name_ja: string;
  name_en: string;
  name_zh: string;
  name_ko: string;
};

export type ResearchField = ResearchCategory & { category_id: string };

export type ResearchCategoryNode = ResearchCategory & {
  fields: ResearchField[];
};

// ロケール別の表示名を引く。欠落時は ja → en の順にフォールバックする。
export function fieldName(
  item: { name_ja: string; name_en: string; name_zh: string; name_ko: string },
  locale: Locale
): string {
  return item[`name_${locale}` as const] || item.name_ja || item.name_en || "";
}

// 研究分野マスター（大分類＋配下細目、sort_order 昇順）を DB から取得する内部関数。
// マスターはアプリからは更新されない静的データなので、リクエストをまたいで
// 1時間キャッシュし、/jobs・/post 表示時の DB 往復をなくす（更新はマイグレーション
// による再シード時のみで、その際は自然失効を待てばよい）。
const fetchResearchFieldTree = unstable_cache(
  async (): Promise<ResearchCategoryNode[]> => {
    const supabase = createServiceClient();
    const [cats, fields] = await Promise.all([
      supabase
        .from("research_categories")
        .select("id, sort_order, name_ja, name_en, name_zh, name_ko")
        .order("sort_order", { ascending: true }),
      supabase
        .from("research_fields")
        .select("id, category_id, sort_order, name_ja, name_en, name_zh, name_ko")
        .order("sort_order", { ascending: true }),
    ]);
    if (cats.error) {
      throw new Error(`研究分野（大分類）の取得に失敗しました: ${cats.error.message}`);
    }
    if (fields.error) {
      throw new Error(`研究分野（細目）の取得に失敗しました: ${fields.error.message}`);
    }

    const byCat = new Map<string, ResearchField[]>();
    for (const f of (fields.data ?? []) as ResearchField[]) {
      const arr = byCat.get(f.category_id) ?? [];
      arr.push(f);
      byCat.set(f.category_id, arr);
    }
    return ((cats.data ?? []) as ResearchCategory[]).map((c) => ({
      ...c,
      fields: byCat.get(c.id) ?? [],
    }));
  },
  ["research-field-tree"],
  { revalidate: 3600 }
);

// リクエスト内では React cache でメモ化しつつ、実データは上の unstable_cache で
// リクエストをまたいで共有する。
export const getResearchFieldTree = cache(
  (): Promise<ResearchCategoryNode[]> => fetchResearchFieldTree()
);

// 既存 field_id 集合（有効な細目のみ）。フォーム送信値の検証に使う。
export const getValidFieldIds = cache(async (): Promise<Set<string>> => {
  const tree = await getResearchFieldTree();
  const ids = new Set<string>();
  for (const cat of tree) for (const f of cat.fields) ids.add(f.id);
  return ids;
});

// 1求人が持つ細目 id の配列
export async function getListingFieldIds(listingId: string): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listing_research_fields")
    .select("field_id")
    .eq("listing_id", listingId);
  if (error) {
    throw new Error(`求人の研究分野の取得に失敗しました: ${error.message}`);
  }
  return ((data ?? []) as { field_id: string }[]).map((r) => r.field_id);
}

// 掲載保存時に細目を差し替える（全削除→再挿入）。
// 不正な field_id は FK 制約で弾かれる。呼び出し側で fieldIds を検証済みであること。
export async function replaceListingFields(
  listingId: string,
  fieldIds: string[]
): Promise<void> {
  const supabase = createServiceClient();
  const { error: delError } = await supabase
    .from("listing_research_fields")
    .delete()
    .eq("listing_id", listingId);
  if (delError) {
    throw new Error(`研究分野の更新に失敗しました: ${delError.message}`);
  }
  const unique = [...new Set(fieldIds)];
  if (unique.length === 0) return;
  const { error: insError } = await supabase
    .from("listing_research_fields")
    .insert(unique.map((field_id) => ({ listing_id: listingId, field_id })));
  if (insError) {
    throw new Error(`研究分野の登録に失敗しました: ${insError.message}`);
  }
}

// カード表示用：複数求人について、紐づく細目から大分類を引き、
// 求人ごとに大分類（重複排除・sort_order 昇順、最大11）へ畳み込む。
// listing_research_fields → research_fields(category_id) を1クエリで取得し、
// 大分類のラベルはマスター（getResearchFieldTree）から補う。
export async function getCategoriesForListings(
  listingIds: string[]
): Promise<Map<string, ListingCategory[]>> {
  const unique = [...new Set(listingIds)];
  if (unique.length === 0) return new Map();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listing_research_fields")
    .select("listing_id, research_fields(category_id)")
    .in("listing_id", unique);
  if (error) {
    throw new Error(`求人の大分類の取得に失敗しました: ${error.message}`);
  }

  // 大分類マスター（id → {ラベル, 表示順}）
  const tree = await getResearchFieldTree();
  const catInfo = new Map(
    tree.map((c, idx) => [
      c.id,
      {
        order: c.sort_order ?? idx,
        cat: {
          id: c.id,
          name_ja: c.name_ja,
          name_en: c.name_en,
          name_zh: c.name_zh,
          name_ko: c.name_ko,
        } as ListingCategory,
      },
    ])
  );

  type Row = { listing_id: string; research_fields: { category_id: string } | null };
  const seen = new Map<string, Set<string>>();
  const result = new Map<string, ListingCategory[]>();
  for (const row of (data ?? []) as unknown as Row[]) {
    const catId = row.research_fields?.category_id;
    if (!catId) continue;
    const info = catInfo.get(catId);
    if (!info) continue;
    const set = seen.get(row.listing_id) ?? new Set<string>();
    if (set.has(catId)) continue;
    set.add(catId);
    seen.set(row.listing_id, set);
    const arr = result.get(row.listing_id) ?? [];
    arr.push(info.cat);
    result.set(row.listing_id, arr);
  }
  // 各求人の大分類を sort_order 昇順に整列
  for (const [lid, arr] of result) {
    arr.sort(
      (a, b) => (catInfo.get(a.id)?.order ?? 0) - (catInfo.get(b.id)?.order ?? 0)
    );
    result.set(lid, arr);
  }
  return result;
}

// 検索用：指定した細目 id のいずれかを持つ求人の id 集合。
// 大分類での絞り込みは呼び出し側（UI）で配下細目に展開済みの id を渡す。
export async function getListingIdsForFields(
  fieldIds: string[]
): Promise<string[]> {
  const unique = [...new Set(fieldIds)];
  if (unique.length === 0) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("listing_research_fields")
    .select("listing_id")
    .in("field_id", unique);
  if (error) {
    throw new Error(`研究分野での絞り込みに失敗しました: ${error.message}`);
  }
  return [...new Set((data ?? []).map((r) => (r as { listing_id: string }).listing_id))];
}
