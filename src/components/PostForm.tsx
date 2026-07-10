"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  EMPLOYMENT_TYPE_CODES,
  FIELD_CODES,
  JOB_TYPE_CODES,
  LOCALES,
  ORGANIZATION_TYPE_CODES,
  type Locale,
} from "@/lib/filters";
import { COUNTRY_CODES, getCountryName } from "@/lib/countries";
import { PREFECTURES } from "@/lib/prefectures";
import type { FormState } from "@/app/[locale]/post/actions";
import ResearchFieldSelect from "@/components/ResearchFieldSelect";

// ResearchFieldSelect に渡す大分類ツリー（server の researchFields.ts と構造互換）
type Named = { name_ja: string; name_en: string; name_zh: string; name_ko: string };
type FieldTree = (Named & {
  id: string;
  fields: (Named & { id: string; category_id: string })[];
})[];

type InitialValues = {
  title?: string;
  summary?: string;
  field?: string;
  field_ids?: string[];
  job_type?: string;
  employment_type?: string;
  organization_type?: string;
  country?: string;
  prefecture?: string | null;
  deadline?: string;
  external_url?: string;
  post_language?: string;
  poster_email?: string;
};

type Props = {
  mode: "create" | "edit";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fieldTree: FieldTree;
  initial?: InitialValues;
};

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium";

export default function PostForm({
  mode,
  action,
  fieldTree,
  initial = {},
}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    { status: "idle" }
  );
  const [country, setCountry] = useState(initial.country ?? "JP");
  const today = new Date().toISOString().slice(0, 10);

  // React 19 はアクション完了後にフォームを自動リセットするため、
  // エラー時はサーバーから返ってきた入力値を再表示する
  const current = {
    ...initial,
    ...(state.status === "error" ? state.values : undefined),
  };

  const fieldError = (key: string) => {
    const code = state.errors?.[key as keyof typeof state.errors];
    return code ? (
      <p className="mt-1 text-xs text-brand-accent">{t(`post.errors.${code}`)}</p>
    ) : null;
  };

  // 新規投稿の送信完了：フォームの代わりに完了パネルを表示
  if (mode === "create" && state.status === "sent") {
    return (
      <div className="rounded-lg bg-brand-card p-6">
        <h3 className="mb-2 font-bold">{t("post.successTitle")}</h3>
        <p className="text-sm">{t("post.successBody", { email: state.email ?? "" })}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
      {state.status === "updated" && (
        <div className="rounded bg-brand-card p-3 text-sm font-medium">
          {t("manage.updatedBanner")}
        </div>
      )}
      {state.errors?._form && (
        <div className="rounded bg-brand-accent p-3 text-sm font-medium text-white">
          {t(`post.errors.${state.errors._form}`)}
        </div>
      )}

      {/* ハニーポット：人間には見えない。ボットが値を入れたらサーバー側で破棄 */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <label className={labelClass} htmlFor="post_language">
          {t("post.postLanguage")}
        </label>
        <select
          id="post_language"
          name="post_language"
          defaultValue={current.post_language ?? locale}
          className={inputClass}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {t(`languageNames.${l}`)}
            </option>
          ))}
        </select>
        {fieldError("post_language")}
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          {t("post.titleLabel")}
        </label>
        <input
          id="title"
          name="title"
          defaultValue={current.title ?? ""}
          maxLength={200}
          placeholder={t("post.titlePlaceholder")}
          className={inputClass}
        />
        {fieldError("title")}
      </div>

      <div>
        <label className={labelClass} htmlFor="summary">
          {t("post.summaryLabel")}
        </label>
        <textarea
          id="summary"
          name="summary"
          defaultValue={current.summary ?? ""}
          maxLength={4000}
          rows={8}
          placeholder={t("post.summaryPlaceholder")}
          className={inputClass}
        />
        {fieldError("summary")}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="field">
            {t("filters.field.label")}
          </label>
          <select
            id="field"
            name="field"
            defaultValue={current.field ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              --
            </option>
            {FIELD_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.field.${c}`)}
              </option>
            ))}
          </select>
          {fieldError("field")}
        </div>

        <div>
          <label className={labelClass} htmlFor="job_type">
            {t("filters.jobType.label")}
          </label>
          <select
            id="job_type"
            name="job_type"
            defaultValue={current.job_type ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              --
            </option>
            {JOB_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.jobType.${c}`)}
              </option>
            ))}
          </select>
          {fieldError("job_type")}
        </div>

        <div>
          <label className={labelClass} htmlFor="organization_type">
            {t("filters.organizationType.label")}
          </label>
          <select
            id="organization_type"
            name="organization_type"
            defaultValue={current.organization_type ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              --
            </option>
            {ORGANIZATION_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.organizationType.${c}`)}
              </option>
            ))}
          </select>
          {fieldError("organization_type")}
        </div>

        <div>
          <label className={labelClass} htmlFor="employment_type">
            {t("filters.employmentType.label")}
          </label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue={current.employment_type ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              --
            </option>
            {EMPLOYMENT_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.employmentType.${c}`)}
              </option>
            ))}
          </select>
          {fieldError("employment_type")}
        </div>
      </div>

      <div>
        <label className={labelClass}>{t("researchFields.label")}</label>
        <p className="mb-1 text-xs text-gray-500">{t("researchFields.help")}</p>
        <ResearchFieldSelect
          tree={fieldTree}
          name="rf"
          initialSelected={current.field_ids ?? []}
        />
        {fieldError("field_ids")}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="country">
            {t("search.country")}
          </label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c} value={c}>
                {getCountryName(locale, c)}
              </option>
            ))}
          </select>
          {fieldError("country")}
        </div>

        {country === "JP" && (
          <div>
            <label className={labelClass} htmlFor="prefecture">
              {t("search.prefecture")}
            </label>
            <select
              id="prefecture"
              name="prefecture"
              defaultValue={current.prefecture ?? ""}
              className={inputClass}
            >
              <option value="">{t("search.any")}</option>
              {PREFECTURES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.labels[locale]}
                </option>
              ))}
            </select>
            {fieldError("prefecture")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="deadline">
            {t("post.deadlineLabel")}
          </label>
          <input
            id="deadline"
            type="date"
            name="deadline"
            defaultValue={current.deadline ?? ""}
            min={today}
            className={inputClass}
          />
          {fieldError("deadline")}
        </div>

        <div>
          <label className={labelClass} htmlFor="external_url">
            {t("post.urlLabel")}
          </label>
          <input
            id="external_url"
            type="url"
            name="external_url"
            defaultValue={current.external_url ?? ""}
            placeholder={t("post.urlPlaceholder")}
            className={inputClass}
          />
          {fieldError("external_url")}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="poster_email">
          {t("post.emailLabel")}
        </label>
        <input
          id="poster_email"
          type="email"
          name="poster_email"
          defaultValue={current.poster_email ?? ""}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">{t("post.emailNote")}</p>
        {fieldError("poster_email")}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-primary px-6 py-3 font-bold text-white hover:brightness-105 disabled:opacity-50 sm:w-auto"
      >
        {isPending
          ? t("post.submitting")
          : mode === "create"
            ? t("post.submit")
            : t("manage.update")}
      </button>
    </form>
  );
}
