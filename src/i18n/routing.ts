import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // スペイン語(es)を追加する場合はここに加え、messages/es.json を用意する
  locales: ["ja", "en", "zh", "ko"],
  defaultLocale: "ja",
});
