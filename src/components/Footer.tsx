import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-brand-primary px-4 py-10 text-center text-xs text-white/60">
      <p className="mb-1 text-sm font-bold text-white">
        {t("common.siteTitle")}
      </p>
      <p className="mb-5">{t("common.tagline")}</p>
      <nav className="mb-4 flex flex-wrap justify-center gap-5">
        <Link href="/links" className="text-white/80 transition hover:text-white">
          {t("nav.links")}
        </Link>
        <Link href="/terms" className="text-white/80 transition hover:text-white">
          {t("nav.terms")}
        </Link>
        <Link href="/privacy" className="text-white/80 transition hover:text-white">
          {t("nav.privacy")}
        </Link>
      </nav>
      <p>
        © {new Date().getFullYear()}{" "}
        <a
          href="https://academianote.site"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 underline transition hover:text-white"
        >
          アカデミアノート
        </a>
      </p>
    </footer>
  );
}
