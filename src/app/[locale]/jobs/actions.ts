"use server";

import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReportState = "idle" | "done";

// 通報（§10）：report_count を加算するだけ。通報者の情報は一切保存しない。
// 同一ブラウザからの二重通報は Cookie で抑止する。
export async function reportListingAction(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return "done";

  const store = await cookies();
  const cookieName = `reported_${id}`;
  if (store.get(cookieName)) return "done";

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("listings")
    .select("report_count")
    .eq("id", id)
    .maybeSingle();
  if (data) {
    await supabase
      .from("listings")
      .update({ report_count: data.report_count + 1 })
      .eq("id", id);
  }

  store.set(cookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 86400,
  });
  return "done";
}
