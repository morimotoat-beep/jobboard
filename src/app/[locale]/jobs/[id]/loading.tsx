import Header from "@/components/Header";

// /jobs/[id] のストリーミング用フォールバック。getPublishedListing の取得中に
// このスケルトンが即表示される（詳細ページのレイアウトに合わせた白基調）。
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="animate-pulse">
          {/* 戻るリンク */}
          <div className="mb-4 h-4 w-24 rounded bg-gray-200" />

          <article className="rounded-lg border border-gray-200 bg-white p-6">
            {/* タグ */}
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="h-5 w-16 rounded bg-gray-200" />
              <div className="h-5 w-20 rounded bg-gray-200" />
              <div className="h-5 w-24 rounded bg-gray-200" />
            </div>

            {/* タイトル */}
            <div className="mb-6 h-8 w-3/4 rounded bg-gray-200" />

            {/* メタ情報 */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-40 rounded bg-gray-200" />
              ))}
            </div>

            {/* 地図 */}
            <div className="mb-6 h-48 max-w-md rounded-lg bg-gray-200" />

            {/* 本文 */}
            <div className="mb-8 space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>

            {/* 応募ボタン */}
            <div className="h-12 w-full rounded-lg bg-gray-200" />
          </article>
        </div>
      </main>
    </div>
  );
}
