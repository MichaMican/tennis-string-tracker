import type { KnottingTechnique } from "./api";

export function formatWeight(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value} kg`;
}

export function formatKnotting(value: KnottingTechnique | null): string {
  if (value === 2) return "2 knots";
  if (value === 4) return "4 knots";
  return "—";
}

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns today's date formatted as YYYY-MM-DD for date inputs. */
export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
