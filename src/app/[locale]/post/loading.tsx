import Header from "@/components/Header";

// /post のストリーミング用フォールバック。研究分野マスター取得中に即表示される
// （投稿フォームのレイアウトに合わせた白基調）。
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="animate-pulse">
          {/* 見出し・導入 */}
          <div className="mb-2 h-7 w-48 rounded bg-gray-200" />
          <div className="mb-6 h-4 w-72 rounded bg-gray-200" />

          {/* フォーム項目 */}
          <div className="space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
                <div className="h-9 w-full rounded border border-gray-200 bg-gray-100" />
              </div>
            ))}

            {/* 本文テキストエリア */}
            <div>
              <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
              <div className="h-28 w-full rounded border border-gray-200 bg-gray-100" />
            </div>

            {/* 送信ボタン */}
            <div className="h-11 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      </main>
    </div>
  );
}
