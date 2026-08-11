import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { CommentAuthor, StringEntryInput, Tracker } from "../api";
import { StringEntryCard } from "../components/StringEntryCard";
import { StringEntryForm } from "../components/StringEntryForm";
import { useNoIndex } from "../useNoIndex";
import { useI18n } from "../i18n/useI18n";

export function TrackerPage() {
  useNoIndex();
  const { t } = useI18n();
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeError, setChangeError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const load = useCallback(async (password?: string) => {
    try {
      const t = await api.getTracker(id, password);
      setTracker(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tracker.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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
        setError(err instanceof Error ? err.message : t("tracker.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const trackerUrl = `${window.location.origin}/trackers/${id}`;

  const handleCreate = async (input: StringEntryInput) => {
    await api.createEntry(id, input, editPassword);
    setAdding(false);
    await load(editPassword);
  };

  const handleUpdate = async (entryId: string, input: StringEntryInput) => {
    await api.updateEntry(id, entryId, input, editPassword);
    await load(editPassword);
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm(t("tracker.confirmDeleteEntry")))
      return;
    await api.deleteEntry(id, entryId, editPassword);
    await load(editPassword);
  };

  const handleAddComment = async (
    entryId: string,
    text: string,
    author: CommentAuthor
  ) => {
    await api.addComment(id, entryId, text, author, editPassword);
    await load(editPassword);
  };

  const handleDeleteComment = async (entryId: string, commentId: string) => {
    await api.deleteComment(id, entryId, commentId, editPassword);
    await load(editPassword);
  };

  const handleToggleEdit = () => {
    if (editMode) {
      setEditMode(false);
      setAdding(false);
      setChangingPassword(false);
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
      // Reload so the stringer-only comments become visible.
      await load(passwordInput);
    } catch {
      setPasswordError(t("tracker.passwordIncorrect"));
    } finally {
      setVerifying(false);
    }
  };

  const openPasswordChange = () => {
    setChangingPassword(true);
    setNewPassword("");
    setConfirmPassword("");
    setChangeError(null);
  };

  const applyPasswordChange = async (password: string | null) => {
    setSavingPassword(true);
    setChangeError(null);
    try {
      await api.updateEditPassword(id, password, editPassword);
      const next = password ?? undefined;
      setEditPassword(next);
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      await load(next);
    } catch (err) {
      setChangeError(
        err instanceof Error ? err.message : t("tracker.passwordChangeFailed")
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setChangeError(t("tracker.passwordEmpty"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError(t("tracker.passwordMismatch"));
      return;
    }
    await applyPasswordChange(newPassword);
  };

  const handleRemovePassword = async () => {
    if (!window.confirm(t("tracker.confirmRemovePassword"))) return;
    await applyPasswordChange(null);
  };

  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !tracker) {
    return (
      <div className="center-screen">
        <p className="error">{error ?? t("tracker.notFound")}</p>
        <Link to="/" className="btn">
          {t("common.backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <Link to="/" className="btn btn-sm">
          {t("common.home")}
        </Link>
        <div className="spacer" />
        <Link to={`/trackers/${id}/history`} className="btn btn-sm">
          {t("tracker.history")}
        </Link>
        <button
          className={editMode ? "btn-sm btn-primary" : "btn-sm"}
          onClick={handleToggleEdit}
        >
          {editMode ? t("tracker.done") : t("tracker.edit")}
        </button>
      </div>

      <h1>{t("tracker.title")}</h1>

      {askingPassword && !editMode && (
        <form
          className="card stack"
          style={{ marginBottom: "1.5rem" }}
          onSubmit={handlePasswordSubmit}
        >
          <h3>{t("tracker.passwordTitle")}</h3>
          <p className="muted">{t("tracker.passwordIntro")}</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder={t("tracker.passwordPlaceholder")}
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
              {verifying ? t("tracker.checking") : t("tracker.unlock")}
            </button>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setAskingPassword(false)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {editMode && (
        <div className="stack" style={{ marginBottom: "1.5rem" }}>
          {adding ? (
            <div className="card">
              <h3>{t("tracker.newEntryTitle")}</h3>
              <StringEntryForm
                submitLabel={t("tracker.addEntry")}
                onSubmit={handleCreate}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setAdding(true)}>
              {t("tracker.createEntry")}
            </button>
          )}

          {changingPassword ? (
            <form className="card stack" onSubmit={handlePasswordChangeSubmit}>
              <h3>
                {tracker.hasEditPassword
                  ? t("tracker.changePasswordTitle")
                  : t("tracker.setPasswordTitle")}
              </h3>
              <p className="muted">{t("tracker.changePasswordIntro")}</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("tracker.newPasswordPlaceholder")}
                autoComplete="new-password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("tracker.confirmPasswordPlaceholder")}
                autoComplete="new-password"
              />
              {changeError && <p className="error">{changeError}</p>}
              <div className="row">
                <button
                  type="submit"
                  className="btn-sm btn-primary"
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? t("tracker.savingPassword")
                    : t("tracker.savePassword")}
                </button>
                {tracker.hasEditPassword && (
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={handleRemovePassword}
                    disabled={savingPassword}
                  >
                    {t("tracker.removePassword")}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => setChangingPassword(false)}
                  disabled={savingPassword}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <button className="btn" onClick={openPasswordChange}>
              {tracker.hasEditPassword
                ? t("tracker.changePassword")
                : t("tracker.setPassword")}
            </button>
          )}
        </div>
      )}

      {tracker.stringEntries.length === 0 ? (
        <p className="muted">
          {t("tracker.noEntries")}
          {!editMode && t("tracker.noEntriesHint")}
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
              onAddComment={(text, author) =>
                handleAddComment(entry.id, text, author)
              }
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
