import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { getAllListingsForAdmin } from "@/lib/listings";
import type { Listing } from "@/lib/types";
import {
  adminDeleteAction,
  adminLogoutAction,
  adminSetStatusAction,
} from "./actions";

const STATUS_LABELS: Record<Listing["status"], string> = {
  draft: "未公開",
  published: "公開中",
  expired: "掲載終了",
  link_flagged: "リンク確認中",
  hidden: "非表示",
};

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <li className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded px-2 py-0.5 font-bold ${
            listing.status === "published"
              ? "bg-brand-card"
              : listing.status === "hidden"
                ? "bg-brand-accent text-white"
                : "bg-brand-tab"
          }`}
        >
          {STATUS_LABELS[listing.status]}
        </span>
        {listing.report_count > 0 && (
          <span className="rounded bg-brand-accent px-2 py-0.5 font-bold text-white">
            通報 {listing.report_count} 件
          </span>
        )}
        <span className="text-gray-500">締切 {listing.deadline}</span>
        <span className="text-gray-500">{listing.poster_email}</span>
      </div>

      <p className="mb-2 font-bold">
        {listing.status === "published" ? (
          <a
            href={`/ja/jobs/${listing.id}`}
            target="_blank"
            className="underline"
          >
            {listing.title}
          </a>
        ) : (
          listing.title
        )}
      </p>
      <p className="mb-3 text-xs break-all text-gray-500">
        {listing.external_url}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {listing.status !== "hidden" ? (
          <form action={adminSetStatusAction}>
            <input type="hidden" name="id" value={listing.id} />
            <input type="hidden" name="status" value="hidden" />
            <button className="rounded bg-brand-accent px-3 py-1 text-xs font-bold text-white hover:brightness-105">
              非表示にする
            </button>
          </form>
        ) : (
          <form action={adminSetStatusAction}>
            <input type="hidden" name="id" value={listing.id} />
            <input type="hidden" name="status" value="published" />
            <button className="rounded bg-brand-primary px-3 py-1 text-xs font-bold text-white hover:brightness-105">
              再公開する（通報リセット）
            </button>
          </form>
        )}

        <details>
          <summary className="cursor-pointer text-xs text-gray-500 underline">
            完全に削除
          </summary>
          <form action={adminDeleteAction} className="mt-2">
            <input type="hidden" name="id" value={listing.id} />
            <button className="rounded border border-brand-accent px-3 py-1 text-xs font-bold text-brand-accent hover:bg-brand-accent hover:text-white">
              元に戻せません。削除を実行
            </button>
          </form>
        </details>
      </div>
    </li>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const listings = await getAllListingsForAdmin();
  const reported = listings.filter(
    (l) => l.report_count > 0 && l.status !== "hidden"
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">管理画面</h1>
        <form action={adminLogoutAction}>
          <button className="rounded bg-white px-3 py-1 text-sm shadow-sm hover:brightness-95">
            ログアウト
          </button>
        </form>
      </div>

      {reported.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-brand-accent">
            要確認：通報あり（{reported.length}件）
          </h2>
          <ul className="space-y-3">
            {reported.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">全求人（{listings.length}件）</h2>
        {listings.length === 0 ? (
          <p className="rounded-lg bg-brand-tab p-6 text-center text-sm text-gray-600">
            求人はまだありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {listings.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
