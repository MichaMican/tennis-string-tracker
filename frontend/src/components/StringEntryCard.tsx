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

interface CommentFormProps {
  placeholder: string;
  onSubmit: (text: string) => Promise<void>;
}

/**
 * Single-line comment form.
 *
 * Mobile browsers need some extra care here: the submit button stays enabled so
 * a tap is always delivered (iOS ignores taps on disabled buttons), the tap does
 * not blur the input — which would close the on-screen keyboard and reflow the
 * page out from under the finger before the click lands — and the keyboard's
 * enter key is handled explicitly instead of relying on implicit form
 * submission. Failures are shown instead of being swallowed silently.
 */
function CommentForm({ placeholder, onSubmit }: CommentFormProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (busy || trimmed === "") return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.somethingWentWrong")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="row"
      style={{ marginTop: "0.75rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        maxLength={2000}
        enterKeyHint="send"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
          e.preventDefault();
          void submit();
        }}
      />
      <button
        type="submit"
        className="btn-sm"
        disabled={busy}
        onMouseDown={(e) => e.preventDefault()}
      >
        {t("entry.addComment")}
      </button>
      {error && (
        <p className="error" style={{ width: "100%", margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
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
  const { formatAge, formatDate, formatDateTime, formatKnotting, formatWeight } =
    useFormatters();
  const [editing, setEditing] = useState(false);
  const age = formatAge(entry.dateOfStringing);

  const playerComments = entry.comments.filter((c) => c.author !== "Stringer");
  const stringerComments = entry.comments.filter((c) => c.author === "Stringer");

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
        <h3 style={{ margin: 0 }}>
          {formatDate(entry.dateOfStringing)}
          {age && <span className="muted"> ({age})</span>}
        </h3>
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

        <CommentForm
          placeholder={t("entry.commentPlaceholder")}
          onSubmit={(text) => onAddComment(text, "Player")}
        />
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

          <CommentForm
            placeholder={t("entry.stringerCommentPlaceholder")}
            onSubmit={(text) => onAddComment(text, "Stringer")}
          />
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
