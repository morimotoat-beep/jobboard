import type { Locale } from "./filters";

// 利用規約・プライバシーポリシー本文（v1 §11）
// 日英のみ用意し、中韓UIでは英語版を表示する（v1.1 §2）。
// ※最終的な法令確認は専門家（社労士等）が行う想定。
export type LegalSection = { heading: string; body: string };
export type LegalDoc = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

const TERMS: Partial<Record<Locale, LegalDoc>> = {
  ja: {
    title: "利用規約",
    updated: "制定日：2026年6月12日",
    sections: [
      {
        heading: "第1条（適用）",
        body: "本規約は、Academia Jobs（以下「当サイト」）の利用に関する条件を定めるものです。利用者は、本規約に同意のうえ当サイトを利用するものとします。",
      },
      {
        heading: "第2条（サービス内容）",
        body: "当サイトは、研究者向け求人情報の掲載の場および外部求人サイトへのリンク集を提供する情報提供サービスです。職業紹介・あっせんは行いません。求人への応募は各掲載元の外部サイトで行われ、当サイトは応募情報を一切取り扱いません。",
      },
      {
        heading: "第3条（求人掲載と投稿者の責任）",
        body: "求人の掲載内容の正確性・適法性については、投稿者が一切の責任を負います。虚偽の内容、差別的な内容、法令に違反する内容の掲載を禁止します。掲載内容に関して第三者との間に紛争が生じた場合、投稿者が自己の責任と費用で解決するものとします。",
      },
      {
        heading: "第4条（運営者の権限）",
        body: "運営者は、掲載内容が不適切と判断した場合、事前の通知なく掲載の非表示または削除を行うことができます。応募締切を過ぎた求人およびリンク切れが続く求人は、自動的に非表示となります。",
      },
      {
        heading: "第5条（免責）",
        body: "運営者は、掲載内容の正確性・完全性・有用性を保証しません。当サイトの利用、掲載情報、外部サイトへの遷移に関連して利用者または第三者に生じた損害について、運営者の故意または重過失による場合を除き、運営者は責任を負いません。",
      },
      {
        heading: "第6条（規約の変更）",
        body: "運営者は、必要に応じて本規約を変更できます。変更後に当サイトを利用した場合、変更後の規約に同意したものとみなします。",
      },
      {
        heading: "第7条（準拠法・管轄）",
        body: "本規約は日本法に準拠します。当サイトに関する紛争は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "Effective date: June 12, 2026",
    sections: [
      {
        heading: "1. Scope",
        body: "These terms govern the use of Academia Jobs (the \"Site\"). By using the Site, you agree to these terms.",
      },
      {
        heading: "2. Nature of the Service",
        body: "The Site is an information service that hosts researcher job listings and a directory of links to external job sites. It does not provide employment placement or recruiting services. Applications are submitted on each institution's external site; the Site never handles applicant information.",
      },
      {
        heading: "3. Listings and Poster Responsibility",
        body: "Posters are solely responsible for the accuracy and legality of their listings. False, discriminatory, or unlawful content is prohibited. Posters shall resolve any disputes with third parties arising from their listings at their own responsibility and expense.",
      },
      {
        heading: "4. Operator's Rights",
        body: "The operator may hide or remove any listing it deems inappropriate without prior notice. Listings past their deadline or with persistently broken links are hidden automatically.",
      },
      {
        heading: "5. Disclaimer",
        body: "The operator does not guarantee the accuracy, completeness, or usefulness of any listing. Except in cases of willful misconduct or gross negligence, the operator is not liable for damages arising from use of the Site, listed information, or navigation to external sites.",
      },
      {
        heading: "6. Changes to These Terms",
        body: "The operator may amend these terms as needed. Continued use of the Site after changes constitutes acceptance of the amended terms.",
      },
      {
        heading: "7. Governing Law and Jurisdiction",
        body: "These terms are governed by the laws of Japan. The court with jurisdiction over the operator's location shall be the exclusive court of first instance for any disputes concerning the Site.",
      },
    ],
  },
};

const PRIVACY: Partial<Record<Locale, LegalDoc>> = {
  ja: {
    title: "プライバシーポリシー",
    updated: "制定日：2026年6月12日",
    sections: [
      {
        heading: "1. 基本方針",
        body: "当サイトは、求人を探す利用者（求職者）の個人情報を一切収集しません。会員登録、お気に入り保存、求職者向けメールマガジン等の機能はありません。",
      },
      {
        heading: "2. 収集する情報",
        body: "求人投稿者のメールアドレスのみを収集します。これはサイト上に公開されず、投稿の本人確認、編集・削除用リンクの送付、掲載に関する通知のためにのみ使用します。",
      },
      {
        heading: "3. Cookieについて",
        body: "通報の重複防止および運営者のログイン管理のために必要最小限のCookieを使用します。広告配信やトラッキングを目的とするCookieは使用しません。",
      },
      {
        heading: "4. 外部サービスの利用",
        body: "当サイトは、データの保管にSupabase、メール送信にResend、求人本文の自動翻訳にDeepLを利用しています。投稿された求人のタイトル・要約は、翻訳のためDeepL社のAPIに送信されます。",
      },
      {
        heading: "5. 第三者提供",
        body: "法令に基づく場合を除き、収集した情報を第三者に提供しません。",
      },
      {
        heading: "6. 情報の削除",
        body: "投稿者は、確認メールに記載の管理リンクから、いつでも自身の投稿を削除できます。",
      },
      {
        heading: "7. お問い合わせ",
        body: "本ポリシーに関するお問い合わせは、アカデミアノート（academianote.site）の運営者までお願いします。",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Effective date: June 12, 2026",
    sections: [
      {
        heading: "1. Basic Policy",
        body: "The Site does not collect any personal information from job seekers. There is no user registration, no saved favorites, and no job-seeker newsletter.",
      },
      {
        heading: "2. Information We Collect",
        body: "We collect only the email address of job posters. It is never shown on the Site and is used solely to verify postings, send edit/delete links, and notify posters about their listings.",
      },
      {
        heading: "3. Cookies",
        body: "We use only the minimum cookies necessary to prevent duplicate reports and to manage the operator's login. We do not use cookies for advertising or tracking.",
      },
      {
        heading: "4. External Services",
        body: "The Site uses Supabase for data storage, Resend for email delivery, and DeepL for automatic translation. The title and summary of posted listings are sent to the DeepL API for translation.",
      },
      {
        heading: "5. Disclosure to Third Parties",
        body: "We do not disclose collected information to third parties except as required by law.",
      },
      {
        heading: "6. Deletion",
        body: "Posters can delete their own listings at any time via the management link in their confirmation email.",
      },
      {
        heading: "7. Contact",
        body: "For inquiries about this policy, please contact the operator of Academia Note (academianote.site).",
      },
    ],
  },
};

export function getTerms(locale: Locale): LegalDoc {
  return TERMS[locale] ?? TERMS.en!;
}

export function getPrivacy(locale: Locale): LegalDoc {
  return PRIVACY[locale] ?? PRIVACY.en!;
}
