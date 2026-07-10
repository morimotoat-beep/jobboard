import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { getResearchFieldTree } from "@/lib/researchFields";
import { createListingAction } from "./actions";

// 研究分野マスター（DB）を毎リクエスト参照するため動的レンダリングにする
// （ビルド時の静的生成で未適用DBを叩いて失敗するのを防ぐ）。
export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const fieldTree = await getResearchFieldTree();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h2 className="mb-2 text-2xl font-bold">{t("post.title")}</h2>
        <p className="mb-6 text-sm text-gray-600">{t("post.intro")}</p>
        <PostForm mode="create" action={createListingAction} fieldTree={fieldTree} />
      </main>
    </div>
  );
}
