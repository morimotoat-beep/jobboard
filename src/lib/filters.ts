// 指示書§9のフィルター内部コード定義。
// 表示ラベルは messages/{locale}.json の filters 名前空間に持つ。

export const LOCALES = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const FIELD_CODES = [
  "field_math",
  "field_physics",
  "field_chemistry",
  "field_biology",
  "field_earth",
  "field_medicine",
  "field_pharmacy",
  "field_agriculture",
  "field_engineering",
  "field_informatics",
  "field_environment",
  "field_interdisciplinary",
] as const;
export type FieldCode = (typeof FIELD_CODES)[number];

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

export const LISTING_STATUSES = [
  "draft",
  "published",
  "expired",
  "link_flagged",
  "hidden",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
