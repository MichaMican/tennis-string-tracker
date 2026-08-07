import { useState } from "react";
import type { StringEntry, StringEntryInput } from "../api";
import { useFormatters } from "../useFormatters";
import { useI18n } from "../i18n/useI18n";
import { QrCode } from "./QrCode";
import { StringEntryForm } from "./StringEntryForm";

interface Props {
  entry: StringEntry;
  trackerUrl: string;
  editMode: boolean;
  onUpdate: (input: StringEntryInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function StringEntryCard({
  entry,
  trackerUrl,
  editMode,
  onUpdate,
  onDelete,
  onAddComment,
  onDeleteComment,
}: Props) {
  const { t } = useI18n();
  const { formatDate, formatKnotting, formatWeight } = useFormatters();
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    setBusy(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText("");
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="card">
        <h3>{t("entry.editTitle")}</h3>
        <StringEntryForm
          initial={entry}
          submitLabel={t("entry.saveChanges")}
          onSubmit={async (input) => {
            await onUpdate(input);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="card stack">
      <div className="row">
        <h3 style={{ margin: 0 }}>{formatDate(entry.dateOfStringing)}</h3>
        <div className="spacer" />
        {editMode && (
          <div className="row">
            <button className="btn-sm" onClick={() => setEditing(true)}>
              {t("entry.editButton")}
            </button>
            <button
              className="btn-sm btn-danger"
              onClick={() => onDelete()}
            >
              {t("entry.delete")}
            </button>
          </div>
        )}
      </div>

      <dl className="info-grid">
        <dt>{t("entry.horizontalWeight")}</dt>
        <dd>{formatWeight(entry.horizontalWeight)}</dd>
        <dt>{t("entry.verticalWeight")}</dt>
        <dd>{formatWeight(entry.verticalWeight)}</dd>
        <dt>{t("entry.stringModel")}</dt>
        <dd>{entry.stringModel ?? t("common.notSpecified")}</dd>
        <dt>{t("entry.knotting")}</dt>
        <dd>{formatKnotting(entry.knotting)}</dd>
      </dl>

      <div>
        <h4 style={{ marginBottom: "0.25rem" }}>{t("entry.comments")}</h4>
        {entry.comments.length === 0 && (
          <p className="muted" style={{ margin: "0.25rem 0" }}>
            {t("entry.noComments")}
          </p>
        )}
        {entry.comments.map((c) => (
          <div className="comment" key={c.id}>
            <span className="spacer">{c.text}</span>
            {editMode && (
              <button
                className="btn-sm btn-danger"
                onClick={() => onDeleteComment(c.id)}
                aria-label={t("entry.deleteComment")}
              >
                {t("entry.delete")}
              </button>
            )}
          </div>
        ))}

        <form
          className="row"
          style={{ marginTop: "0.75rem" }}
          onSubmit={submitComment}
        >
          <input
            value={commentText}
            placeholder={t("entry.commentPlaceholder")}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            className="btn-sm"
            disabled={busy || commentText.trim() === ""}
          >
            {t("entry.addComment")}
          </button>
        </form>
      </div>

      <details>
        <summary className="muted" style={{ cursor: "pointer" }}>
          {t("entry.qrSummary")}
        </summary>
        <div style={{ marginTop: "0.75rem" }}>
          <QrCode
            value={trackerUrl}
            downloadName={`tracker-${entry.id.slice(0, 8)}`}
          />
        </div>
      </details>
    </div>
  );
}
