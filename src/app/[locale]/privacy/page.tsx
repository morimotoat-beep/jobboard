import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getPrivacy } from "@/lib/legal";
import type { Locale } from "@/lib/filters";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage doc={getPrivacy(locale as Locale)} />;
}
