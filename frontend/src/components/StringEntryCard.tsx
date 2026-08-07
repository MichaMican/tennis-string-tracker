import { useState } from "react";
import type {
  Comment,
  CommentAuthor,
  StringEntry,
  StringEntryInput,
} from "../api";
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
  onAddComment: (text: string, author: CommentAuthor) => Promise<void>;
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
  const { formatDate, formatDateTime, formatKnotting, formatWeight } =
    useFormatters();
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [stringerCommentText, setStringerCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const playerComments = entry.comments.filter((c) => c.author !== "Stringer");
  const stringerComments = entry.comments.filter((c) => c.author === "Stringer");

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    setBusy(true);
    try {
      await onAddComment(commentText.trim(), "Player");
      setCommentText("");
    } finally {
      setBusy(false);
    }
  };

  const submitStringerComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stringerCommentText.trim() === "") return;
    setBusy(true);
    try {
      await onAddComment(stringerCommentText.trim(), "Stringer");
      setStringerCommentText("");
    } finally {
      setBusy(false);
    }
  };

  const renderComment = (c: Comment) => (
    <div className="comment" key={c.id}>
      <div className="comment-body">
        <span>{c.text}</span>
        <span className="comment-time">{formatDateTime(c.createdAt)}</span>
      </div>
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
  );

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
        {playerComments.length === 0 && (
          <p className="muted" style={{ margin: "0.25rem 0" }}>
            {t("entry.noComments")}
          </p>
        )}
        {playerComments.map(renderComment)}

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

      {editMode && (
        <div>
          <h4 style={{ marginBottom: "0.25rem" }}>
            {t("entry.stringerComments")}
          </h4>
          <p className="muted" style={{ margin: "0.25rem 0" }}>
            {t("entry.stringerCommentsHint")}
          </p>
          {stringerComments.length === 0 && (
            <p className="muted" style={{ margin: "0.25rem 0" }}>
              {t("entry.noStringerComments")}
            </p>
          )}
          {stringerComments.map(renderComment)}

          <form
            className="row"
            style={{ marginTop: "0.75rem" }}
            onSubmit={submitStringerComment}
          >
            <input
              value={stringerCommentText}
              placeholder={t("entry.stringerCommentPlaceholder")}
              onChange={(e) => setStringerCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="btn-sm"
              disabled={busy || stringerCommentText.trim() === ""}
            >
              {t("entry.addComment")}
            </button>
          </form>
        </div>
      )}

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
