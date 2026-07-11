import Header from "@/components/Header";

// /jobs のストリーミング用フォールバック。クリック直後に即表示され、
// searchListings のデータ取得中はこのスケルトンが見える（既存デザインに合わせた白基調）。
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white px-4 py-12">
        <div className="mx-auto w-full max-w-4xl animate-pulse">
          {/* タイトル領域 */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 h-9 w-64 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
          </div>

          {/* フィルターフォーム */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="h-9 w-full rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* 件数ラベル */}
          <div className="mt-8 mb-3 h-4 w-28 rounded bg-gray-200" />

          {/* 求人カード */}
          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <div className="mb-3 flex gap-2">
                  <div className="h-5 w-16 rounded bg-gray-200" />
                  <div className="h-5 w-20 rounded bg-gray-200" />
                </div>
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
