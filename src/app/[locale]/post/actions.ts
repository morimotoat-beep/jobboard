"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { parseListingForm, type FieldErrors, type ListingInput } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import {
  buildListingTranslations,
  CLEARED_TRANSLATION_COLUMNS,
} from "@/lib/translate";

export type FormState = {
  status: "idle" | "sent" | "updated" | "error";
  errors?: FieldErrors;
  email?: string;
  // エラー時に入力値を返してフォームに再表示する
  // （React 19 はアクション完了後にフォームを自動リセットするため）
  values?: ListingInput;
};

const DAILY_LIMIT = 5;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isBot(formData: FormData): boolean {
  // ハニーポット：人間には見えないフィールドが埋まっていたらボット
  return String(formData.get("website") ?? "") !== "";
}

export async function createListingAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isBot(formData)) {
    // ボットには成功を装って何もしない
    return { status: "sent", email: String(formData.get("poster_email") ?? "") };
  }

  const { data, errors } = parseListingForm(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values: data };
  }

  const supabase = createServiceClient();

  // レート制限：同一メールアドレスからの投稿は24時間に5件まで
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count, error: countError } = await supabase
    .from("listings")
    .select("id", { count: "exact" })
    .eq("poster_email", data.poster_email)
    .gte("created_at", since)
    .limit(1);
  if (countError) {
    return { status: "error", errors: { _form: "sendFailed" }, values: data };
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return { status: "error", errors: { _form: "rateLimited" }, values: data };
  }

  // 投稿確定時に1回だけ翻訳して保存（v1.1 §3。失敗時は原文のみで続行）
  const translations = await buildListingTranslations(data);

  const { data: inserted, error } = await supabase
    .from("listings")
    .insert({ ...data, ...translations, status: "draft" })
    .select("id, edit_token")
    .single();
  if (error || !inserted) {
    return { status: "error", errors: { _form: "sendFailed" }, values: data };
  }

  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "email" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const manageUrl = `${siteUrl}/${locale}/manage/${inserted.edit_token}`;

  const sent = await sendEmail({
    to: data.poster_email,
    subject: t("confirmSubject"),
    text: t("confirmBody", { url: manageUrl }),
  });
  if (!sent.ok) {
    // メールが届かない下書きは残さない
    await supabase.from("listings").delete().eq("id", inserted.id);
    return { status: "error", errors: { _form: "sendFailed" }, values: data };
  }

  return { status: "sent", email: data.poster_email };
}

export async function updateListingAction(
  token: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isBot(formData) || !UUID_RE.test(token)) {
    return { status: "updated" };
  }

  const { data, errors } = parseListingForm(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values: data };
  }

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("edit_token", token)
    .maybeSingle();
  if (!existing) {
    return { status: "error", errors: { _form: "sendFailed" }, values: data };
  }

  // 締切切れ・リンク切れの求人は、編集（締切は必ず未来日になる）で再公開する
  const status =
    existing.status === "expired" || existing.status === "link_flagged"
      ? "published"
      : existing.status;

  // 内容が変わった可能性があるため翻訳を作り直す（古い翻訳は一旦クリア）
  const translations = await buildListingTranslations(data);

  const { error } = await supabase
    .from("listings")
    .update({
      ...data,
      ...CLEARED_TRANSLATION_COLUMNS,
      ...translations,
      status,
      link_check_failures: 0,
    })
    .eq("edit_token", token);
  if (error) {
    return { status: "error", errors: { _form: "sendFailed" }, values: data };
  }
  return { status: "updated" };
}

export async function publishListingAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!UUID_RE.test(token)) return;
  const locale = await getLocale();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "published" })
    .eq("edit_token", token)
    .eq("status", "draft");
  if (error) {
    throw new Error(`公開処理に失敗しました: ${error.message}`);
  }
  redirect(`/${locale}/manage/${token}?published=1`);
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!UUID_RE.test(token)) return;
  const locale = await getLocale();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("edit_token", token);
  if (error) {
    throw new Error(`削除処理に失敗しました: ${error.message}`);
  }
  redirect(`/${locale}`);
}
