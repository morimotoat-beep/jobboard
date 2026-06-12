import "server-only";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
};

// RESEND_API_KEY 未設定（ローカル開発）の場合は、実送信せず
// サーバーのコンソールに本文を出力する。確認リンクはそこから開ける。
export async function sendEmail({ to, subject, text }: SendEmailArgs): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.log("===== メール送信（開発モード：RESEND_API_KEY 未設定のためコンソール出力） =====");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("");
    console.log(text);
    console.log("==============================================================");
    return { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    console.error("Resend API error:", res.status, await res.text());
    return { ok: false };
  }
  return { ok: true };
}
