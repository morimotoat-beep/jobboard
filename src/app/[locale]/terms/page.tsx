import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getTerms } from "@/lib/legal";
import type { Locale } from "@/lib/filters";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage doc={getTerms(locale as Locale)} />;
}
