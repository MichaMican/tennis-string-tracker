import { useMemo } from "react";
import type { KnottingTechnique } from "./api";
import { useI18n } from "./i18n/useI18n";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Strips the time part so only whole calendar days are compared. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Full years and remaining days between two dates, or `null` if `from` lies
 * after `to`.
 */
function yearsAndDaysSince(
  from: Date,
  to: Date
): { years: number; days: number } | null {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (start.getTime() > end.getTime()) return null;

  let years = end.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + years);
  if (anniversary.getTime() > end.getTime()) {
    years -= 1;
    anniversary.setFullYear(start.getFullYear() + years);
  }
  const days = Math.round((end.getTime() - anniversary.getTime()) / MS_PER_DAY);
  return { years, days };
}

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
      /**
       * Elapsed time since the given date as `1y 10d ago`. Returns `null` for
       * invalid or future dates so callers can omit the hint entirely.
       */
      formatAge(value: string): string | null {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        const age = yearsAndDaysSince(d, new Date());
        if (!age) return null;
        return age.years > 0
          ? t("age.yearsDaysAgo", { years: age.years, days: age.days })
          : t("age.daysAgo", { days: age.days });
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
