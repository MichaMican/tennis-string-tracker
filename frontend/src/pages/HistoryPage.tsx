import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { HistoryEntry } from "../api";
import { formatDateTime } from "../utils";
import { useNoIndex } from "../useNoIndex";

const COMMENT_FIELDS = ["Comment", "Player comment", "Stringer comment"];

function isCommentField(field: string | null): boolean {
  return field !== null && COMMENT_FIELDS.includes(field);
}

function describe(h: HistoryEntry): string {
  const label = h.entityLabel ? `${h.entityLabel} — ` : "";

  if (h.action === "Update" && h.field) {
    const oldV = h.oldValue ?? "—";
    const newV = h.newValue ?? "—";
    return `${label}${h.field}: ${oldV} → ${newV}`;
  }

  if (h.action === "Create") {
    if (isCommentField(h.field))
      return `${label}${h.field} added: "${h.newValue}"`;
    return `${label}${h.newValue ?? "Created"}`;
  }

  if (h.action === "Delete") {
    if (isCommentField(h.field))
      return `${label}${h.field} deleted: "${h.oldValue}"`;
    return `${label}Deleted. Last state — ${h.oldValue ?? ""}`;
  }

  return label;
}

export function HistoryPage() {
  useNoIndex();
  const { id = "" } = useParams();

  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getHistory(id)
      .then(setHistory)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load history")
      );
  }, [id]);

  if (error) {
    return (
      <div className="center-screen">
        <p className="error">{error}</p>
        <Link to={`/trackers/${id}`} className="btn">
          Back to tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <Link to={`/trackers/${id}`} className="btn btn-sm">
          ← Back to tracker
        </Link>
      </div>

      <h1>Change history</h1>

      {!history ? (
        <p className="muted">Loading…</p>
      ) : history.length === 0 ? (
        <p className="muted">No changes recorded yet.</p>
      ) : (
        <div className="stack">
          {history.map((h) => (
            <div className="history-item" key={h.id}>
              <div className="row">
                <span className="badge">{h.action}</span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {formatDateTime(h.timestamp)}
                </span>
              </div>
              <div style={{ marginTop: "0.25rem" }}>{describe(h)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
