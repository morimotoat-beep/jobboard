"use client";

import { useEffect } from "react";

// LP内の .btn-fx ボタンを監視し、ビューポートに入った瞬間に一度だけ
// wobble アニメーションを発火させる（IntersectionObserver）。
// 個別ボタンにロジックを重複させないよう、この1コンポーネントに集約する。
export default function ButtonMotion() {
  useEffect(() => {
    // モーション控えめ設定なら何もしない（CSS 側でも二重にガード済み）
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".btn-fx")
    );
    if (els.length === 0) return;

    // アニメーション終了でクラスを外す＝1回のみ・以後はホバーtransitionに委ねる
    const onEnd = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      el.classList.remove("btn-wobble");
      el.removeEventListener("animationend", onEnd);
    };

    const wobble = (el: HTMLElement) => {
      el.addEventListener("animationend", onEnd);
      el.classList.add("btn-wobble");
    };

    // IntersectionObserver 非対応環境ではフォールバックで一度だけ揺らす
    if (typeof IntersectionObserver === "undefined") {
      els.forEach(wobble);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            wobble(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
