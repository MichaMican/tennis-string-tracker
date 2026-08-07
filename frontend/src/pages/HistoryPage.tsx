import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { HistoryEntry } from "../api";
import { useFormatters } from "../useFormatters";
import { useNoIndex } from "../useNoIndex";
import { useI18n } from "../i18n/useI18n";
import type { TranslationKey } from "../i18n/translations";
import { translations } from "../i18n/translations";

type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>
) => string;

const COMMENT_FIELDS = ["Comment", "Player comment", "Stringer comment"];

function isCommentField(field: string | null): boolean {
  return field !== null && COMMENT_FIELDS.includes(field);
}

function hasKey(key: string): key is TranslationKey {
  return key in translations.en;
}

/** Translates a field name recorded by the backend, falling back to it. */
function translateField(t: Translate, field: string): string {
  const key = `history.field.${field}`;
  return hasKey(key) ? t(key) : field;
}

/** Translates the finite set of enum-like values recorded by the backend. */
function translateValue(t: Translate, value: string): string {
  if (value === "2 knots") return t("knotting.2");
  if (value === "4 knots") return t("knotting.4");
  return value;
}

/**
 * Translates the field names inside a `Field: value; Field: value` summary as
 * recorded by the backend for deleted string entries.
 */
function translateSummary(t: Translate, summary: string): string {
  return summary
    .split("; ")
    .map((part) => {
      const index = part.indexOf(": ");
      if (index === -1) return part;
      const field = part.slice(0, index);
      const value = part.slice(index + 2);
      return `${translateField(t, field)}: ${translateValue(t, value)}`;
    })
    .join("; ");
}

/** Translates the `String entry (yyyy-MM-dd)` label recorded by the backend. */
function translateLabel(
  t: Translate,
  formatDate: (value: string) => string,
  label: string
): string {
  const match = /^String entry \((\d{4}-\d{2}-\d{2})\)$/.exec(label);
  if (!match) return label;
  return t("history.entryLabel", { date: formatDate(match[1]) });
}

function describe(
  h: HistoryEntry,
  t: Translate,
  formatDate: (value: string) => string
): string {
  const label = h.entityLabel
    ? `${translateLabel(t, formatDate, h.entityLabel)} — `
    : "";

  if (h.action === "Update" && h.field) {
    const dash = t("common.notSpecified");
    const oldV = h.oldValue ? translateValue(t, h.oldValue) : dash;
    const newV = h.newValue ? translateValue(t, h.newValue) : dash;
    return `${label}${translateField(t, h.field)}: ${oldV} → ${newV}`;
  }

  if (h.action === "Create") {
    if (isCommentField(h.field))
      return `${label}${t("history.commentAdded", {
        field: translateField(t, h.field as string),
        value: h.newValue ?? "",
      })}`;
    if (h.newValue === "Created new string entry" || !h.newValue)
      return `${label}${t("history.created")}`;
    return `${label}${h.newValue}`;
  }

  if (h.action === "Delete") {
    if (isCommentField(h.field))
      return `${label}${t("history.commentDeleted", {
        field: translateField(t, h.field as string),
        value: h.oldValue ?? "",
      })}`;
    return `${label}${t("history.deleted", {
      value: translateSummary(t, h.oldValue ?? ""),
    })}`;
  }

  return label;
}

function translateAction(t: Translate, action: string): string {
  const key = `history.action.${action}`;
  return hasKey(key) ? t(key) : action;
}

export function HistoryPage() {
  useNoIndex();
  const { t } = useI18n();
  const { formatDate, formatDateTime } = useFormatters();
  const { id = "" } = useParams();

  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getHistory(id)
      .then(setHistory)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t("history.loadFailed"))
      );
  }, [id, t]);

  if (error) {
    return (
      <div className="center-screen">
        <p className="error">{error}</p>
        <Link to={`/trackers/${id}`} className="btn">
          {t("history.backPlain")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <Link to={`/trackers/${id}`} className="btn btn-sm">
          {t("history.back")}
        </Link>
      </div>

      <h1>{t("history.title")}</h1>

      {!history ? (
        <p className="muted">{t("common.loading")}</p>
      ) : history.length === 0 ? (
        <p className="muted">{t("history.empty")}</p>
      ) : (
        <div className="stack">
          {history.map((h) => (
            <div className="history-item" key={h.id}>
              <div className="row">
                <span className="badge">{translateAction(t, h.action)}</span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {formatDateTime(h.timestamp)}
                </span>
              </div>
              <div style={{ marginTop: "0.25rem" }}>
                {describe(h, t, formatDate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
