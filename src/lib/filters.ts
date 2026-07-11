// 指示書§9のフィルター内部コード定義。
// 表示ラベルは messages/{locale}.json の filters 名前空間に持つ。

export const LOCALES = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const JOB_TYPE_CODES = [
  "job_professor",
  "job_assoc_prof",
  "job_lecturer",
  "job_assistant_prof",
  "job_fixed_faculty",
  "job_postdoc",
  "job_technical",
  "job_grad_student",
] as const;
export type JobTypeCode = (typeof JOB_TYPE_CODES)[number];

// 雇用形態：アカデミア群と企業群に分け、機関種別（organization_type）で出し分ける。
export const ACADEMIA_EMPLOYMENT_CODES = [
  "emp_fixed",
  "emp_permanent",
  "emp_tenure_track",
] as const;
export const COMPANY_EMPLOYMENT_CODES = [
  "emp_regular",
  "emp_contract",
  "emp_dispatch",
  "emp_gyomu",
  "emp_other",
] as const;
export const EMPLOYMENT_TYPE_CODES = [
  ...ACADEMIA_EMPLOYMENT_CODES,
  ...COMPANY_EMPLOYMENT_CODES,
] as const;
export type EmploymentTypeCode = (typeof EMPLOYMENT_TYPE_CODES)[number];

// 機関種別に対応する雇用形態コード群。
// company=企業群 / university・research_institute=アカデミア群 / それ以外（すべて）=両方。
export function employmentCodesForOrg(
  org: string
): readonly EmploymentTypeCode[] {
  if (org === "company") return COMPANY_EMPLOYMENT_CODES;
  if (org === "university" || org === "research_institute")
    return ACADEMIA_EMPLOYMENT_CODES;
  return EMPLOYMENT_TYPE_CODES;
}

// 職種セレクトを表示するか（企業は職種の概念がないため非表示）。
export function showJobTypeForOrg(org: string): boolean {
  return org !== "company";
}

// 機関種別（募集元の種類）
export const ORGANIZATION_TYPE_CODES = [
  "university",
  "research_institute",
  "company",
] as const;
export type OrganizationTypeCode = (typeof ORGANIZATION_TYPE_CODES)[number];

export const LISTING_STATUSES = [
  "draft",
  "published",
  "expired",
  "link_flagged",
  "hidden",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
