import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { createListingAction } from "./actions";

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h2 className="mb-2 text-2xl font-bold">{t("post.title")}</h2>
        <p className="mb-6 text-sm text-gray-600">{t("post.intro")}</p>
        <PostForm mode="create" action={createListingAction} />
      </main>
    </div>
  );
}
