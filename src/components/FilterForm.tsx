"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ACADEMIA_EMPLOYMENT_CODES,
  COMPANY_EMPLOYMENT_CODES,
  JOB_TYPE_CODES,
  ORGANIZATION_TYPE_CODES,
  employmentCodesForOrg,
  showJobTypeForOrg,
  type Locale,
} from "@/lib/filters";
import { COUNTRY_CODES, getCountryName } from "@/lib/countries";
import { PREFECTURES } from "@/lib/prefectures";
import ResearchFieldSelect from "@/components/ResearchFieldSelect";

type Named = { name_ja: string; name_en: string; name_zh: string; name_ko: string };
type FieldTree = (Named & {
  id: string;
  fields: (Named & { id: string; category_id: string })[];
})[];

export type FilterValues = {
  jobType: string;
  employmentType: string;
  organizationType: string;
  country: string;
  prefecture: string;
  q: string;
  researchFieldIds: string[];
};

const selectClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none";

export default function FilterForm({
  values,
  fieldTree,
}: {
  values: FilterValues;
  fieldTree: FieldTree;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  // 機関種別を起点にカスケード：職種の表示可否・雇用形態の選択肢を切り替える
  const [org, setOrg] = useState(values.organizationType);
  const [emp, setEmp] = useState(values.employmentType);

  const showJob = showJobTypeForOrg(org);

  const onOrgChange = (next: string) => {
    setOrg(next);
    // 切替後の機関種別で無効になった雇用形態はリセットする
    const allowed = employmentCodesForOrg(next) as readonly string[];
    if (emp && !allowed.includes(emp)) setEmp("");
  };

  return (
    <form
      method="get"
      action={`/${locale}/jobs`}
      className="rounded-lg border border-gray-200 bg-brand-bg p-6"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 機関種別（カスケードの起点） */}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            {t("filters.organizationType.label")}
          </span>
          <select
            name="org"
            value={org}
            onChange={(e) => onOrgChange(e.target.value)}
            className={selectClass}
          >
            <option value="">{t("search.all")}</option>
            {ORGANIZATION_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.organizationType.${c}`)}
              </option>
            ))}
          </select>
        </label>

        {/* 職種：企業のときは非表示 */}
        {showJob && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              {t("filters.jobType.label")}
            </span>
            <select name="job" defaultValue={values.jobType} className={selectClass}>
              <option value="">{t("search.all")}</option>
              {JOB_TYPE_CODES.map((c) => (
                <option key={c} value={c}>
                  {t(`filters.jobType.${c}`)}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* 雇用形態：機関種別で選択肢を切替（すべて＝optgroupで両群） */}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            {t("filters.employmentType.label")}
          </span>
          <select
            name="emp"
            value={emp}
            onChange={(e) => setEmp(e.target.value)}
            className={selectClass}
          >
            <option value="">{t("search.all")}</option>
            {org === "" ? (
              <>
                <optgroup label={t("filters.employmentType.groupAcademia")}>
                  {ACADEMIA_EMPLOYMENT_CODES.map((c) => (
                    <option key={c} value={c}>
                      {t(`filters.employmentType.${c}`)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("filters.employmentType.groupCompany")}>
                  {COMPANY_EMPLOYMENT_CODES.map((c) => (
                    <option key={c} value={c}>
                      {t(`filters.employmentType.${c}`)}
                    </option>
                  ))}
                </optgroup>
              </>
            ) : (
              employmentCodesForOrg(org).map((c) => (
                <option key={c} value={c}>
                  {t(`filters.employmentType.${c}`)}
                </option>
              ))
            )}
          </select>
        </label>

        {/* 国・地域 */}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("search.country")}</span>
          <select name="country" defaultValue={values.country} className={selectClass}>
            <option value="">{t("search.all")}</option>
            {COUNTRY_CODES.map((c) => (
              <option key={c} value={c}>
                {getCountryName(locale, c)}
              </option>
            ))}
          </select>
        </label>

        {/* 都道府県 */}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("search.prefecture")}</span>
          <select name="pref" defaultValue={values.prefecture} className={selectClass}>
            <option value="">{t("search.any")}</option>
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.labels[locale]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 研究分野 */}
      <div className="mt-3">
        <span className="mb-1 block text-sm font-medium">
          {t("researchFields.label")}
        </span>
        <ResearchFieldSelect
          tree={fieldTree}
          name="rf"
          initialSelected={values.researchFieldIds}
        />
      </div>

      {/* キーワード + 送信 */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="q"
          defaultValue={values.q}
          placeholder={t("search.keywordPlaceholder")}
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-primary px-8 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          {t("search.searchButton")}
        </button>
      </div>
    </form>
  );
}
