"use client";

import { useTranslations } from "next-intl";
import { useDeadlineSoon } from "@/lib/useDeadlineSoon";

// 締切間近バッジ。締切判定は現在時刻依存のためクライアント側で行う
// （ListingCard をサーバーコンポーネントのまま保つための切り出し）。
// SSRでは非表示、ハイドレーション後に付く。
export default function DeadlineSoonBadge({ deadline }: { deadline: string }) {
  const t = useTranslations();
  if (!useDeadlineSoon(deadline)) return null;
  return (
    <span className="rounded bg-brand-accent px-2 py-0.5 font-bold text-white">
      {t("listing.deadlineSoon")}
    </span>
  );
}
