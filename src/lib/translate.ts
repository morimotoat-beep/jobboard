import "server-only";

// DeepL による自動翻訳（v1.1 §3）
// - 投稿確定時に1回だけ翻訳してDBに保存（表示のたびに翻訳しない）
// - 日⇔英の2方向のみ。中韓はカラムだけ用意し翻訳実行は後日
// - DEEPL_API_KEY 未設定や翻訳失敗時は null を返し、原文表示にフォールバック

type Lang = "ja" | "en";

const DEEPL_SOURCE: Record<Lang, string> = { ja: "JA", en: "EN" };
const DEEPL_TARGET: Record<Lang, string> = { ja: "JA", en: "EN-US" };

async function callDeepl(
  texts: string[],
  source: Lang,
  target: Lang
): Promise<string[] | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return null;

  // Free プランのキーは「:fx」で終わり、エンドポイントが異なる
  const endpoint = key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: DEEPL_SOURCE[source],
        target_lang: DEEPL_TARGET[target],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("DeepL API error:", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { translations: { text: string }[] };
    if (json.translations.length !== texts.length) return null;
    return json.translations.map((t) => t.text);
  } catch (e) {
    console.error("DeepL API error:", e);
    return null;
  }
}

export async function translateTexts(
  texts: string[],
  source: Lang,
  target: Lang
): Promise<string[] | null> {
  if (!process.env.DEEPL_API_KEY) return null;
  // 一時的な失敗（タイムアウト・5xx）に備えて1回だけリトライする
  const first = await callDeepl(texts, source, target);
  if (first) return first;
  return callDeepl(texts, source, target);
}

// 投稿・更新時に翻訳カラムの値を組み立てる。
// オリジナルは自言語のカラムにそのまま入れ、日⇔英のみ翻訳を生成する。
export async function buildListingTranslations(input: {
  title: string;
  summary: string;
  post_language: string;
}): Promise<Record<string, string>> {
  const cols: Record<string, string> = {};
  const lang = input.post_language;

  if (lang === "ja" || lang === "en" || lang === "zh" || lang === "ko") {
    cols[`title_${lang}`] = input.title;
    cols[`summary_${lang}`] = input.summary;
  }

  if (lang === "ja" || lang === "en") {
    const target: Lang = lang === "ja" ? "en" : "ja";
    const translated = await translateTexts(
      [input.title, input.summary],
      lang,
      target
    );
    if (translated) {
      cols[`title_${target}`] = translated[0];
      cols[`summary_${target}`] = translated[1];
    }
  }

  return cols;
}

// 更新時に古い翻訳が残らないよう、全翻訳カラムを一旦クリアするための値
export const CLEARED_TRANSLATION_COLUMNS = {
  title_ja: null,
  title_en: null,
  title_zh: null,
  title_ko: null,
  summary_ja: null,
  summary_en: null,
  summary_zh: null,
  summary_ko: null,
} as const;
