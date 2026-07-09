"use client";

import { useSyncExternalStore } from "react";

const SOON_MS = 7 * 24 * 60 * 60 * 1000;

// useSyncExternalStore の subscribe：現在時刻は購読不要なので何もしない
const subscribe = () => () => {};

// 締切が7日以内かどうかを返す。
// 現在時刻の読み取り（Date.now）はレンダー中に呼ぶと react-hooks の純粋性ルールに
// 抵触するため、useSyncExternalStore の getSnapshot 内で行う（これが正規の逃げ道）。
// SSR では getServerSnapshot が false を返し（バッジ非表示）、ハイドレーション後に
// クライアント側で再評価される。ハイドレーション不一致も起きない。
export function useDeadlineSoon(deadline: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => new Date(`${deadline}T00:00:00`).getTime() - Date.now() <= SOON_MS,
    () => false
  );
}
