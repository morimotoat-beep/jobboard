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

export const EMPLOYMENT_TYPE_CODES = [
  "emp_fixed",
  "emp_permanent",
  "emp_tenure_track",
] as const;
export type EmploymentTypeCode = (typeof EMPLOYMENT_TYPE_CODES)[number];

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
