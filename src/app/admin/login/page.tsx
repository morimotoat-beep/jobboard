import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { adminLoginAction } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAdmin()) {
    redirect("/admin");
  }
  const sp = await searchParams;

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-6 text-xl font-bold">管理画面ログイン</h1>

      {sp.error === "1" && (
        <p className="mb-4 rounded bg-brand-accent p-3 text-sm font-medium text-white">
          パスワードが違います。
        </p>
      )}
      {!process.env.ADMIN_PASSWORD && (
        <p className="mb-4 rounded bg-brand-accent p-3 text-sm font-medium text-white">
          ADMIN_PASSWORD が未設定です。.env.local（本番は Vercel の環境変数）に設定してください。
        </p>
      )}

      <form
        action={adminLoginAction}
        className="space-y-4 rounded-lg bg-white p-6 shadow-sm"
      >
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          autoFocus
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded bg-brand-primary px-4 py-2 font-bold text-white hover:brightness-105"
        >
          ログイン
        </button>
      </form>
    </main>
  );
}
