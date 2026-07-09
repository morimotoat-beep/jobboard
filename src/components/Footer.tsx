import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-brand-primary px-4 py-10 text-center text-xs text-white/60">
      {/* ネイビー地でも視認できるよう白の角丸チップにロゴを載せる */}
      <div className="mb-4 flex justify-center">
        <span className="inline-flex rounded-lg bg-white px-4 py-2">
          <Image
            src="/logo.png"
            alt={t("common.siteTitle")}
            width={600}
            height={135}
            className="h-8 w-auto sm:h-9"
          />
        </span>
      </div>
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
