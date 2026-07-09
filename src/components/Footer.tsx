import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-brand-tab px-4 py-8 text-center text-xs text-gray-600">
      <p className="mb-1 text-sm font-black text-brand-primary">
        {t("common.siteTitle")}
      </p>
      <p className="mb-4">{t("common.tagline")}</p>
      <nav className="mb-3 flex flex-wrap justify-center gap-4">
        <Link href="/links" className="underline">
          {t("nav.links")}
        </Link>
        <Link href="/terms" className="underline">
          {t("nav.terms")}
        </Link>
        <Link href="/privacy" className="underline">
          {t("nav.privacy")}
        </Link>
      </nav>
      <p>
        © {new Date().getFullYear()}{" "}
        <a
          href="https://academianote.site"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          アカデミアノート
        </a>
      </p>
    </footer>
  );
}
