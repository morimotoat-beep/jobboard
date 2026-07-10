"use client";

import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/filters";

// 研究分野の細目（306件）を「大分類→細目」の2段階で選ぶ。
//  1) 大分類を単一 select で選ぶ（省スペース）
//  2) その配下の細目だけをチェックボックス（複数選択）で表示。名前で絞り込み可。
// 選択済み細目は大分類をまたいで保持し、上部に×付きチップで一覧表示する。
// 送信値は従来どおり field_id を同名 hidden input で複数送信（name 既定: "rf"）。
// DB・データ・送信仕様は不変で、見た目/操作のみを変更。

type Named = {
  name_ja: string;
  name_en: string;
  name_zh: string;
  name_ko: string;
};
type FieldItem = Named & { id: string; category_id: string };
type CategoryNode = Named & { id: string; fields: FieldItem[] };

type Props = {
  tree: CategoryNode[];
  name?: string; // hidden input 名（既定: "rf"）
  initialSelected?: string[];
};

// ロケール別の表示名。欠落時は ja → en フォールバック。
function nm(item: Named, locale: Locale): string {
  return item[`name_${locale}` as const] || item.name_ja || item.name_en || "";
}

export default function ResearchFieldSelect({
  tree,
  name = "rf",
  initialSelected = [],
}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const uid = useId();

  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...new Set(initialSelected),
  ]);
  const [activeCatId, setActiveCatId] = useState<string>("");
  const [query, setQuery] = useState("");

  // チップ表示用：id → 細目
  const fieldById = useMemo(() => {
    const m = new Map<string, FieldItem>();
    for (const cat of tree) for (const f of cat.fields) m.set(f.id, f);
    return m;
  }, [tree]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activeCat = useMemo(
    () => tree.find((c) => c.id === activeCatId) ?? null,
    [tree, activeCatId]
  );

  const q = query.trim().toLowerCase();
  const matches = (f: Named) =>
    !q ||
    f.name_ja.toLowerCase().includes(q) ||
    f.name_en.toLowerCase().includes(q) ||
    f.name_zh.toLowerCase().includes(q) ||
    f.name_ko.toLowerCase().includes(q);

  const visibleFields = activeCat ? activeCat.fields.filter(matches) : [];

  // アクティブ大分類の全細目が選択済みか（「まとめて選択／解除」の切り替え用）
  const allInCatSelected =
    !!activeCat &&
    activeCat.fields.length > 0 &&
    activeCat.fields.every((f) => selectedSet.has(f.id));

  const toggleId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const removeId = (id: string) =>
    setSelectedIds((prev) => prev.filter((x) => x !== id));

  // 「まとめて選択／解除」：配下細目 id を展開して保持（大分類 id は送らない）
  const toggleCategory = () => {
    if (!activeCat) return;
    const ids = activeCat.fields.map((f) => f.id);
    setSelectedIds((prev) =>
      allInCatSelected
        ? prev.filter((x) => !ids.includes(x))
        : [...new Set([...prev, ...ids])]
    );
  };

  const listboxId = `${uid}-fields`;

  return (
    <div className="rounded-md border border-gray-300 bg-white p-3">
      {/* 選択済みチップ（大分類をまたいで保持） */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const f = fieldById.get(id);
            if (!f) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-tab px-2.5 py-1 text-xs text-brand-primary"
              >
                {nm(f, locale)}
                <button
                  type="button"
                  onClick={() => removeId(id)}
                  aria-label={`${nm(f, locale)}: ${t("researchFields.remove")}`}
                  className="rounded text-brand-primary/60 hover:text-brand-primary focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="rounded text-xs text-gray-400 underline hover:text-gray-600 focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
          >
            {t("researchFields.clearAll")}
          </button>
        </div>
      )}

      {/* 1段目：大分類の単一 select */}
      <select
        aria-label={t("researchFields.categoryPlaceholder")}
        value={activeCatId}
        onChange={(e) => {
          setActiveCatId(e.target.value);
          setQuery("");
        }}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
      >
        <option value="">{t("researchFields.categoryPlaceholder")}</option>
        {tree.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {nm(cat, locale)}
          </option>
        ))}
      </select>

      {/* 2段目：配下細目のチェックボックス群 */}
      {activeCat && (
        <div className="mt-2">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={toggleCategory}
              aria-pressed={allInCatSelected}
              className="shrink-0 rounded border border-brand-primary/40 px-2.5 py-1 text-xs text-brand-primary hover:bg-brand-tab focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            >
              {allInCatSelected
                ? t("researchFields.deselectCategory")
                : t("researchFields.selectCategory")}
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("researchFields.searchPlaceholder")}
              placeholder={t("researchFields.searchPlaceholder")}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div
            id={listboxId}
            role="group"
            aria-label={nm(activeCat, locale)}
            className="max-h-64 overflow-y-auto rounded border border-gray-200"
          >
            {visibleFields.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">
                {t("researchFields.noResults")}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {visibleFields.map((f) => {
                  const checked = selectedSet.has(f.id);
                  return (
                    <li key={f.id}>
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-brand-bg">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleId(f.id)}
                          className="h-4 w-4 shrink-0 accent-brand-primary"
                        />
                        <span>{nm(f, locale)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 送信用 hidden input（同名 repeated → field_id[] として送信） */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
