import { useState } from "react";
import type { StringEntry, StringEntryInput } from "../api";
import { formatDate, formatKnotting, formatWeight } from "../utils";
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
        <h3>Edit string entry</h3>
        <StringEntryForm
          initial={entry}
          submitLabel="Save changes"
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
              Edit
            </button>
            <button
              className="btn-sm btn-danger"
              onClick={() => onDelete()}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <dl className="info-grid">
        <dt>Horizontal weight</dt>
        <dd>{formatWeight(entry.horizontalWeight)}</dd>
        <dt>Vertical weight</dt>
        <dd>{formatWeight(entry.verticalWeight)}</dd>
        <dt>String model / manufacturer</dt>
        <dd>{entry.stringModel ?? "—"}</dd>
        <dt>Knotting technique</dt>
        <dd>{formatKnotting(entry.knotting)}</dd>
      </dl>

      <div>
        <h4 style={{ marginBottom: "0.25rem" }}>Player comments</h4>
        {entry.comments.length === 0 && (
          <p className="muted" style={{ margin: "0.25rem 0" }}>
            No comments yet.
          </p>
        )}
        {entry.comments.map((c) => (
          <div className="comment" key={c.id}>
            <span className="spacer">{c.text}</span>
            {editMode && (
              <button
                className="btn-sm btn-danger"
                onClick={() => onDeleteComment(c.id)}
                aria-label="Delete comment"
              >
                Delete
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
            placeholder="Add a comment…"
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            className="btn-sm"
            disabled={busy || commentText.trim() === ""}
          >
            Add
          </button>
        </form>
      </div>

      <details>
        <summary className="muted" style={{ cursor: "pointer" }}>
          QR code for this tracker
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
