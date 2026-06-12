"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  isAdmin,
  verifyPassword,
} from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function adminLoginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function adminSetStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID_RE.test(id) || !["published", "hidden"].includes(status)) return;

  const supabase = createServiceClient();
  // 再公開時は通報カウントをリセット（確認済みのため）
  const update =
    status === "published" ? { status, report_count: 0 } : { status };
  const { error } = await supabase.from("listings").update(update).eq("id", id);
  if (error) {
    throw new Error(`状態の変更に失敗しました: ${error.message}`);
  }
  redirect("/admin");
}

export async function adminDeleteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`);
  }
  redirect("/admin");
}
