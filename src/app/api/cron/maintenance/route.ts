import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import type { Listing } from "@/lib/types";

// Vercel Cron から1日1回呼ばれる自動メンテナンス（指示書§7）
// 1. 締切超過の求人を expired に（締切が主たる削除トリガー）
// 2. 外部リンクの死活チェック。404/410 が3日連続で link_flagged ＋ 投稿者へ通知
//    大学サイトはボットを弾くことがあるため、403やタイムアウトは失敗扱いにしない

export const maxDuration = 60;

const CHECK_BATCH = 25; // 1回の実行でチェックする最大件数（実行時間制限対策）
const FLAG_THRESHOLD = 3;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // シークレット未設定時はローカル開発のみ許可
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function checkUrl(url: string): Promise<"ok" | "gone" | "unknown"> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "AcademiaNoteJobsBot/1.0 (+https://jobs.academianote.site)",
      },
    });
    await res.body?.cancel();
    if (res.status === 404 || res.status === 410) return "gone";
    return "ok";
  } catch {
    return "unknown"; // タイムアウト・ネットワークエラーはカウントしない
  }
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const result = { expired: 0, checked: 0, flagged: 0, restored: 0 };

  // 1. 締切超過 → expired（データは保持・非表示のみ）
  const { data: expiredRows, error: expireError } = await supabase
    .from("listings")
    .update({ status: "expired" })
    .eq("status", "published")
    .lt("deadline", today)
    .select("id");
  if (expireError) {
    return NextResponse.json({ error: expireError.message }, { status: 500 });
  }
  result.expired = expiredRows?.length ?? 0;

  // 2. リンク死活チェック（チェックが古いものから最大 CHECK_BATCH 件）
  const { data: targets, error: targetError } = await supabase
    .from("listings")
    .select("*")
    .in("status", ["published", "link_flagged"])
    .gte("deadline", today)
    .order("last_link_checked_at", { ascending: true, nullsFirst: true })
    .limit(CHECK_BATCH);
  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  for (const listing of (targets ?? []) as Listing[]) {
    const check = await checkUrl(listing.external_url);
    result.checked++;

    if (check === "unknown") {
      await supabase
        .from("listings")
        .update({ last_link_checked_at: now })
        .eq("id", listing.id);
      continue;
    }

    if (check === "ok") {
      // リンクが回復した link_flagged は自動で再公開する
      const restored = listing.status === "link_flagged";
      await supabase
        .from("listings")
        .update({
          link_check_failures: 0,
          last_link_checked_at: now,
          ...(restored ? { status: "published" } : {}),
        })
        .eq("id", listing.id);
      if (restored) result.restored++;
      continue;
    }

    // gone（404/410）
    const failures = listing.link_check_failures + 1;
    const shouldFlag =
      failures >= FLAG_THRESHOLD && listing.status === "published";
    await supabase
      .from("listings")
      .update({
        link_check_failures: failures,
        last_link_checked_at: now,
        ...(shouldFlag ? { status: "link_flagged" } : {}),
      })
      .eq("id", listing.id);

    if (shouldFlag) {
      result.flagged++;
      const locale = listing.post_language;
      const t = await getTranslations({ locale, namespace: "email" });
      const manageUrl = `${siteUrl}/${locale}/manage/${listing.edit_token}`;
      await sendEmail({
        to: listing.poster_email,
        subject: t("linkFlaggedSubject"),
        text: t("linkFlaggedBody", { title: listing.title, url: manageUrl }),
      });
    }
  }

  return NextResponse.json(result);
}
