import { useMemo } from "react";
import type { KnottingTechnique } from "./api";
import { useI18n } from "./i18n/useI18n";

/**
 * Locale-aware formatters for weights, knotting techniques and dates.
 */
export function useFormatters() {
  const { locale, t } = useI18n();

  return useMemo(
    () => ({
      formatWeight(value: number | null): string {
        if (value === null || value === undefined)
          return t("common.notSpecified");
        return t("weight.kg", { value: value.toLocaleString(locale) });
      },
      formatKnotting(value: KnottingTechnique | null): string {
        if (value === 2) return t("knotting.2");
        if (value === 4) return t("knotting.4");
        return t("common.notSpecified");
      },
      formatDate(value: string): string {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
      formatDateTime(value: string): string {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    }),
    [locale, t]
  );
}
