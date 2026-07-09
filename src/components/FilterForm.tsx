import { useLocale, useTranslations } from "next-intl";
import {
  EMPLOYMENT_TYPE_CODES,
  FIELD_CODES,
  JOB_TYPE_CODES,
  type Locale,
} from "@/lib/filters";
import { COUNTRY_CODES, getCountryName } from "@/lib/countries";
import { PREFECTURES } from "@/lib/prefectures";

export type FilterValues = {
  field: string;
  jobType: string;
  employmentType: string;
  country: string;
  prefecture: string;
  within: string;
  q: string;
};

const selectClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none";

export default function FilterForm({ values }: { values: FilterValues }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <form method="get" action={`/${locale}/jobs`} className="rounded-2xl bg-white p-6 shadow-md">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("filters.field.label")}</span>
          <select name="field" defaultValue={values.field} className={selectClass}>
            <option value="">{t("search.all")}</option>
            {FIELD_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.field.${c}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("filters.jobType.label")}</span>
          <select name="job" defaultValue={values.jobType} className={selectClass}>
            <option value="">{t("search.all")}</option>
            {JOB_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.jobType.${c}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            {t("filters.employmentType.label")}
          </span>
          <select name="emp" defaultValue={values.employmentType} className={selectClass}>
            <option value="">{t("search.all")}</option>
            {EMPLOYMENT_TYPE_CODES.map((c) => (
              <option key={c} value={c}>
                {t(`filters.employmentType.${c}`)}
              </option>
            ))}
          </select>
        </label>

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

        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("search.deadline")}</span>
          <select name="within" defaultValue={values.within} className={selectClass}>
            <option value="">{t("search.any")}</option>
            <option value="7">{t("search.within7")}</option>
            <option value="30">{t("search.within30")}</option>
            <option value="90">{t("search.within90")}</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="q"
          defaultValue={values.q}
          placeholder={t("search.keywordPlaceholder")}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-primary px-8 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-105"
        >
          {t("search.searchButton")}
        </button>
      </div>
    </form>
  );
}
