"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

// LP マウント時に主要導線（/jobs・/post）を先読みしてルーターキャッシュに載せる。
// これらのリンクは <Link prefetch> でもビューポートに入るまで先読みされないため、
// ページ下部の「すべての求人を見る」のようにスクロールしないと現れない CTA は、
// 見えた瞬間にクリックすると先読みが間に合わず遅く感じる。マウント時に一度
// 先読みしておくことで、スクロール位置に関係なくクリック時は即遷移になる。
const ROUTES = ["/jobs", "/post"] as const;

export default function LandingPrefetch() {
  const router = useRouter();
  useEffect(() => {
    for (const href of ROUTES) router.prefetch(href);
  }, [router]);
  return null;
}
