"use client";

import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/filters";

// 研究分野の細目（306件）を Headless UI Combobox（multiple）で選択する。
// 大分類でグルーピングし、name_ja/en/zh/ko を横断して部分一致検索する。
// 「この大分類をまとめて選択」ボタンのみ自前で追加。
// 選択値は field_id の配列を同名 hidden input で送信（通常の form でそのまま複数値送信）。

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
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...new Set(initialSelected),
  ]);
  const [query, setQuery] = useState("");

  const fieldById = useMemo(() => {
    const m = new Map<string, FieldItem>();
    for (const cat of tree) for (const f of cat.fields) m.set(f.id, f);
    return m;
  }, [tree]);

  const q = query.trim().toLowerCase();
  const matches = (f: Named) =>
    !q ||
    f.name_ja.toLowerCase().includes(q) ||
    f.name_en.toLowerCase().includes(q) ||
    f.name_zh.toLowerCase().includes(q) ||
    f.name_ko.toLowerCase().includes(q);

  // 大分類・細目とも sort_order 昇順（tree は取得時に整列済み）。検索で該当0の大分類は隠す。
  const groups = tree
    .map((cat) => ({ cat, fields: cat.fields.filter(matches) }))
    .filter((g) => g.fields.length > 0);

  const addCategory = (cat: CategoryNode) =>
    setSelectedIds((prev) => [...new Set([...prev, ...cat.fields.map((f) => f.id)])]);

  const removeId = (id: string) =>
    setSelectedIds((prev) => prev.filter((x) => x !== id));

  return (
    <div className="rounded-md border border-gray-300 bg-white p-3">
      {/* 選択済みチップ */}
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
                  aria-label={t("researchFields.remove")}
                  className="text-brand-primary/60 hover:text-brand-primary"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            {t("researchFields.clearAll")}
          </button>
        </div>
      )}

      <Combobox
        multiple
        value={selectedIds}
        onChange={(v: string[]) => setSelectedIds(v)}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            placeholder={t("researchFields.searchPlaceholder")}
            displayValue={() => query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ComboboxOptions
            static
            className="mt-1 max-h-72 w-full overflow-y-auto rounded border border-gray-200 bg-white text-sm shadow-sm"
          >
            {groups.length === 0 && (
              <div className="px-3 py-2 text-gray-400">
                {t("researchFields.noResults")}
              </div>
            )}
            {groups.map(({ cat, fields }) => (
              <div key={cat.id} className="py-1">
                <div className="flex items-center gap-2 bg-brand-bg px-2 py-1.5">
                  <span className="flex-1 text-xs font-bold text-brand-primary">
                    {nm(cat, locale)}
                  </span>
                  <button
                    type="button"
                    // オプション領域内クリックでの blur/閉じを防ぐ
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addCategory(cat)}
                    className="shrink-0 rounded border border-brand-primary/40 px-2 py-0.5 text-[11px] text-brand-primary hover:bg-brand-tab"
                  >
                    {t("researchFields.selectCategory")}
                  </button>
                </div>
                {fields.map((f) => (
                  <ComboboxOption
                    key={f.id}
                    value={f.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 data-[focus]:bg-brand-bg"
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-brand-primary bg-brand-primary text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </span>
                        <span>{nm(f, locale)}</span>
                      </>
                    )}
                  </ComboboxOption>
                ))}
              </div>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* 送信用 hidden input（同名 repeated → field_id[] として送信） */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
