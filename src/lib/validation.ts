import {
  EMPLOYMENT_TYPE_CODES,
  FIELD_CODES,
  JOB_TYPE_CODES,
  LOCALES,
  ORGANIZATION_TYPE_CODES,
} from "./filters";
import { COUNTRY_CODES } from "./countries";
import { PREFECTURE_CODES } from "./prefectures";

export type ListingInput = {
  title: string;
  summary: string;
  field: string;
  // 研究分野マスター（細目）の選択。listings 列ではなく listing_research_fields に保存する。
  field_ids: string[];
  job_type: string;
  employment_type: string;
  organization_type: string;
  country: string;
  prefecture: string | null;
  deadline: string;
  external_url: string;
  post_language: string;
  poster_email: string;
};

// 1求人あたりの細目選択の上限（暴走防止）
export const MAX_RESEARCH_FIELDS = 50;

// 値はエラーコード（messages の post.errors.* キーに対応）
export type FieldErrors = Partial<Record<keyof ListingInput | "_form", string>>;

export function parseListingForm(formData: FormData): {
  data: ListingInput;
  errors: FieldErrors;
} {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const data: ListingInput = {
    title: get("title"),
    summary: get("summary"),
    field: get("field"),
    field_ids: formData
      .getAll("rf")
      .map((v) => String(v).trim())
      .filter(Boolean),
    job_type: get("job_type"),
    employment_type: get("employment_type"),
    organization_type: get("organization_type"),
    country: get("country"),
    prefecture: get("prefecture") || null,
    deadline: get("deadline"),
    external_url: get("external_url"),
    post_language: get("post_language"),
    poster_email: get("poster_email").toLowerCase(),
  };

  const errors: FieldErrors = {};

  if (!data.title) errors.title = "required";
  else if (data.title.length > 200) errors.title = "titleTooLong";

  if (!data.summary) errors.summary = "required";
  else if (data.summary.length > 4000) errors.summary = "summaryTooLong";

  if (!(FIELD_CODES as readonly string[]).includes(data.field)) {
    errors.field = "invalidChoice";
  }

  // 研究分野（細目）は新規掲載から必須。有効な id かどうかは呼び出し側（DBの
  // マスター照合）で最終確認する。ここでは必須と上限だけをチェックする。
  if (data.field_ids.length === 0) {
    errors.field_ids = "required";
  } else if (data.field_ids.length > MAX_RESEARCH_FIELDS) {
    errors.field_ids = "tooManyFields";
  }
  if (!(JOB_TYPE_CODES as readonly string[]).includes(data.job_type)) {
    errors.job_type = "invalidChoice";
  }
  if (!(EMPLOYMENT_TYPE_CODES as readonly string[]).includes(data.employment_type)) {
    errors.employment_type = "invalidChoice";
  }
  if (!(ORGANIZATION_TYPE_CODES as readonly string[]).includes(data.organization_type)) {
    errors.organization_type = "invalidChoice";
  }
  if (!(COUNTRY_CODES as readonly string[]).includes(data.country)) {
    errors.country = "invalidChoice";
  }

  if (data.country !== "JP") {
    data.prefecture = null;
  } else if (data.prefecture && !PREFECTURE_CODES.includes(data.prefecture)) {
    errors.prefecture = "invalidChoice";
  }

  // 締切は今日以降・2年以内
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.deadline)) {
    errors.deadline = "invalidDeadline";
  } else {
    const today = new Date().toISOString().slice(0, 10);
    const max = new Date(Date.now() + 2 * 366 * 86400000).toISOString().slice(0, 10);
    if (data.deadline < today || data.deadline > max) {
      errors.deadline = "invalidDeadline";
    }
  }

  if (!/^https?:\/\/.+/i.test(data.external_url) || data.external_url.length > 2000) {
    errors.external_url = "invalidUrl";
  }

  if (!(LOCALES as readonly string[]).includes(data.post_language)) {
    errors.post_language = "invalidChoice";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.poster_email) ||
    data.poster_email.length > 320
  ) {
    errors.poster_email = "invalidEmail";
  }

  return { data, errors };
}
