import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { StringEntryInput, Tracker } from "../api";
import { StringEntryCard } from "../components/StringEntryCard";
import { StringEntryForm } from "../components/StringEntryForm";
import { useNoIndex } from "../useNoIndex";

export function TrackerPage() {
  useNoIndex();
  const { id = "" } = useParams();

  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editPassword, setEditPassword] = useState<string | undefined>(
    undefined
  );
  const [askingPassword, setAskingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api.getTracker(id);
      setTracker(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tracker");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    api
      .getTracker(id)
      .then((t) => {
        if (cancelled) return;
        setTracker(t);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load tracker");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const trackerUrl = `${window.location.origin}/trackers/${id}`;

  const handleCreate = async (input: StringEntryInput) => {
    await api.createEntry(id, input, editPassword);
    setAdding(false);
    await load();
  };

  const handleUpdate = async (entryId: string, input: StringEntryInput) => {
    await api.updateEntry(id, entryId, input, editPassword);
    await load();
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm("Delete this string entry? This cannot be undone."))
      return;
    await api.deleteEntry(id, entryId, editPassword);
    await load();
  };

  const handleAddComment = async (entryId: string, text: string) => {
    await api.addComment(id, entryId, text, editPassword);
    await load();
  };

  const handleDeleteComment = async (entryId: string, commentId: string) => {
    await api.deleteComment(id, entryId, commentId, editPassword);
    await load();
  };

  const handleToggleEdit = () => {
    if (editMode) {
      setEditMode(false);
      setAdding(false);
      return;
    }
    if (tracker?.hasEditPassword && editPassword === undefined) {
      setAskingPassword(true);
      setPasswordInput("");
      setPasswordError(null);
      return;
    }
    setEditMode(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setPasswordError(null);
    try {
      await api.verifyEditPassword(id, passwordInput);
      setEditPassword(passwordInput);
      setAskingPassword(false);
      setEditMode(true);
    } catch {
      setPasswordError("Incorrect password.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !tracker) {
    return (
      <div className="center-screen">
        <p className="error">{error ?? "Tracker not found"}</p>
        <Link to="/" className="btn">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <Link to="/" className="btn btn-sm">
          ← Home
        </Link>
        <div className="spacer" />
        <Link to={`/trackers/${id}/history`} className="btn btn-sm">
          History
        </Link>
        <button
          className={editMode ? "btn-sm btn-primary" : "btn-sm"}
          onClick={handleToggleEdit}
        >
          {editMode ? "Done" : "Edit"}
        </button>
      </div>

      <h1>String history</h1>

      {askingPassword && !editMode && (
        <form
          className="card stack"
          style={{ marginBottom: "1.5rem" }}
          onSubmit={handlePasswordSubmit}
        >
          <h3>Edit password required</h3>
          <p className="muted">
            This tracker is protected. Enter the edit password to make changes.
          </p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Edit password"
            autoComplete="current-password"
            autoFocus
          />
          {passwordError && <p className="error">{passwordError}</p>}
          <div className="row">
            <button
              type="submit"
              className="btn-sm btn-primary"
              disabled={verifying}
            >
              {verifying ? "Checking…" : "Unlock"}
            </button>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setAskingPassword(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {editMode && (
        <div className="stack" style={{ marginBottom: "1.5rem" }}>
          {adding ? (
            <div className="card">
              <h3>New string entry</h3>
              <StringEntryForm
                submitLabel="Add entry"
                onSubmit={handleCreate}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setAdding(true)}>
              + Create new string entry
            </button>
          )}
        </div>
      )}

      {tracker.stringEntries.length === 0 ? (
        <p className="muted">
          No string entries yet.
          {!editMode && " Press Edit to add the first one."}
        </p>
      ) : (
        <div className="stack">
          {tracker.stringEntries.map((entry) => (
            <StringEntryCard
              key={entry.id}
              entry={entry}
              trackerUrl={trackerUrl}
              editMode={editMode}
              onUpdate={(input) => handleUpdate(entry.id, input)}
              onDelete={() => handleDelete(entry.id)}
              onAddComment={(text) => handleAddComment(entry.id, text)}
              onDeleteComment={(commentId) =>
                handleDeleteComment(entry.id, commentId)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
