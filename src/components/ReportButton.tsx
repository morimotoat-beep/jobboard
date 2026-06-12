"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  reportListingAction,
  type ReportState,
} from "@/app/[locale]/jobs/actions";

export default function ReportButton({ listingId }: { listingId: string }) {
  const t = useTranslations("listing");
  const [state, formAction, isPending] = useActionState<ReportState, FormData>(
    reportListingAction,
    "idle"
  );

  if (state === "done") {
    return <p className="text-xs text-gray-500">{t("reported")}</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={listingId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-gray-400 underline hover:text-brand-accent disabled:opacity-50"
      >
        {t("report")}
      </button>
    </form>
  );
}
