import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { StringerCredentials, TrackerBookmark } from "../api";
import { QrScanner } from "../components/QrScanner";
import { QrDownloadButton } from "../components/QrDownloadButton";
import {
  getStringerCredentials,
  setStringerCredentials,
} from "../stringerSession";
import { useNoIndex } from "../useNoIndex";
import { useFormatters } from "../useFormatters";
import { useI18n } from "../i18n/useI18n";

const GUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Extracts a tracker id from a raw id or a tracker URL. */
function parseTrackerId(input: string): string | null {
  const match = GUID_PATTERN.exec(input.trim());
  return match ? match[0].toLowerCase() : null;
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

interface BookmarkCardProps {
  bookmark: TrackerBookmark;
  onSave: (name: string | null, tags: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
}

function BookmarkCard({ bookmark, onSave, onDelete }: BookmarkCardProps) {
  const { t } = useI18n();
  const { formatWeight, formatDate } = useFormatters();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(bookmark.name ?? "");
  const [tags, setTags] = useState(bookmark.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim() ? name.trim() : null, parseTags(tags));
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.somethingWentWrong")
      );
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form className="card stack" onSubmit={handleSave}>
        <label>
          {t("stringer.bookmarkName")}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("stringer.bookmarkNamePlaceholder")}
            maxLength={200}
          />
        </label>
        <label>
          {t("stringer.bookmarkTags")}
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t("stringer.bookmarkTagsPlaceholder")}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button type="submit" className="btn-sm btn-primary" disabled={saving}>
            {saving ? t("form.saving") : t("stringer.save")}
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => {
              setEditing(false);
              setName(bookmark.name ?? "");
              setTags(bookmark.tags.join(", "));
              setError(null);
            }}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="card"
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/trackers/${bookmark.trackerId}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/trackers/${bookmark.trackerId}`);
      }}
    >
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack" style={{ gap: "0.25rem" }}>
          <strong>{bookmark.name ?? t("stringer.unnamedTracker")}</strong>
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            {bookmark.trackerId}
          </span>
          {bookmark.tags.length > 0 && (
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {bookmark.tags.map((tag) => `#${tag}`).join(" ")}
            </span>
          )}
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {bookmark.latestDateOfStringing
              ? t("stringer.latestStringing", {
                  vertical: formatWeight(bookmark.latestVerticalWeight),
                  horizontal: formatWeight(bookmark.latestHorizontalWeight),
                  date: formatDate(bookmark.latestDateOfStringing),
                })
              : t("stringer.noStringingYet")}
          </span>
        </div>
        <div className="row" onClick={(e) => e.stopPropagation()}>
          <QrDownloadButton
            value={`${window.location.origin}/trackers/${bookmark.trackerId}`}
            downloadName={`tracker-${bookmark.trackerId.slice(0, 8)}`}
          />
          <button
            type="button"
            className="btn-sm"
            onClick={() => setEditing(true)}
          >
            {t("stringer.editBookmark")}
          </button>
          <button type="button" className="btn-sm" onClick={() => void onDelete()}>
            {t("stringer.removeBookmark")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StringerPage() {
  useNoIndex();
  const { t } = useI18n();

  const [credentials, setCredentials] = useState<StringerCredentials | null>(
    getStringerCredentials
  );
  const [bookmarks, setBookmarks] = useState<TrackerBookmark[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auth form state
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Add-bookmark form state
  const [trackerInput, setTrackerInput] = useState("");
  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState(false);

  const loadBookmarks = useCallback(async (creds: StringerCredentials) => {
    try {
      const list = await api.getBookmarks(creds);
      setBookmarks(list);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : t("stringer.loadFailed")
      );
    }
  }, [t]);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    api
      .getBookmarks(credentials)
      .then((list) => {
        if (cancelled) return;
        setBookmarks(list);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : t("stringer.loadFailed")
        );
      });
    return () => {
      cancelled = true;
    };
  }, [credentials, t]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError(null);
    const creds = { username: username.trim(), password };
    try {
      if (mode === "register") {
        await api.registerStringer(creds.username, creds.password);
      }
      await api.loginStringer(creds);
      setStringerCredentials(creds);
      setCredentials(creds);
      setPassword("");
    } catch (err) {
      setAuthError(
        err instanceof Error && err.message && !err.message.startsWith("Request failed (401")
          ? err.message
          : t("stringer.authFailed")
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    setStringerCredentials(null);
    setCredentials(null);
    setBookmarks(null);
  };

  const addBookmark = async (rawInput: string) => {
    if (!credentials) return;
    const trackerId = parseTrackerId(rawInput);
    if (!trackerId) {
      setAddError(t("stringer.invalidTracker"));
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await api.createBookmark(
        credentials,
        trackerId,
        newName.trim() ? newName.trim() : null,
        parseTags(newTags)
      );
      setTrackerInput("");
      setNewName("");
      setNewTags("");
      await loadBookmarks(credentials);
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : t("common.somethingWentWrong")
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBookmark(trackerInput);
  };

  const handleScan = async (text: string) => {
    setScanning(false);
    setTrackerInput(text);
    await addBookmark(text);
  };

  const handleSaveBookmark = async (
    bookmarkId: string,
    name: string | null,
    tags: string[]
  ) => {
    if (!credentials) return;
    await api.updateBookmark(credentials, bookmarkId, name, tags);
    await loadBookmarks(credentials);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!credentials) return;
    if (!window.confirm(t("stringer.confirmRemoveBookmark"))) return;
    await api.deleteBookmark(credentials, bookmarkId);
    await loadBookmarks(credentials);
  };

  if (!credentials) {
    return (
      <div className="center-screen">
        <form
          className="card stack"
          style={{ maxWidth: 420, width: "100%" }}
          onSubmit={handleAuth}
        >
          <h1>{t("stringer.title")}</h1>
          <p className="muted">{t("stringer.intro")}</p>
          <label>
            {t("stringer.username")}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={64}
              required
            />
          </label>
          <label>
            {t("stringer.password")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
            />
          </label>
          {authError && <p className="error">{authError}</p>}
          <div className="row">
            <button
              type="submit"
              className="btn-sm btn-primary"
              disabled={authBusy}
            >
              {authBusy
                ? t("stringer.authBusy")
                : mode === "login"
                  ? t("stringer.login")
                  : t("stringer.register")}
            </button>
            <button
              type="button"
              className="btn-sm"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setAuthError(null);
              }}
            >
              {mode === "login"
                ? t("stringer.switchToRegister")
                : t("stringer.switchToLogin")}
            </button>
          </div>
          <Link to="/" className="muted">
            {t("common.backToHome")}
          </Link>
        </form>
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
        <span className="muted">{credentials.username}</span>
        <button className="btn-sm" onClick={handleLogout}>
          {t("stringer.logout")}
        </button>
      </div>

      <h1>{t("stringer.bookmarksTitle")}</h1>
      <p className="muted">{t("stringer.bookmarksHint")}</p>

      <form
        className="card stack"
        style={{ marginBottom: "1.5rem" }}
        onSubmit={handleAdd}
      >
        <h3>{t("stringer.addBookmarkTitle")}</h3>
        <label>
          {t("stringer.trackerInput")}
          <input
            value={trackerInput}
            onChange={(e) => setTrackerInput(e.target.value)}
            placeholder={t("stringer.trackerInputPlaceholder")}
          />
        </label>
        <label>
          {t("stringer.bookmarkName")}
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("stringer.bookmarkNamePlaceholder")}
            maxLength={200}
          />
        </label>
        <label>
          {t("stringer.bookmarkTags")}
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder={t("stringer.bookmarkTagsPlaceholder")}
          />
        </label>
        {addError && <p className="error">{addError}</p>}
        <div className="row">
          <button type="submit" className="btn-sm btn-primary" disabled={adding}>
            {adding ? t("stringer.addingBookmark") : t("stringer.addBookmark")}
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => setScanning(true)}
          >
            {t("stringer.scanToAdd")}
          </button>
        </div>
        {scanning && (
          <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}
      </form>

      {loadError && <p className="error">{loadError}</p>}
      {bookmarks === null ? (
        <p className="muted">{t("common.loading")}</p>
      ) : bookmarks.length === 0 ? (
        <p className="muted">{t("stringer.noBookmarks")}</p>
      ) : (
        <div className="stack">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onSave={(name, tags) =>
                handleSaveBookmark(bookmark.id, name, tags)
              }
              onDelete={() => handleDeleteBookmark(bookmark.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
