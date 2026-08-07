import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CopyLink } from "../components/CopyLink";
import { QrCode } from "../components/QrCode";
import { useI18n } from "../i18n/useI18n";

export function NewTrackerPage() {
  const { t } = useI18n();
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const tracker = await api.createTracker(editPassword || undefined);
      setTrackerId(tracker.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newTracker.failed"));
    } finally {
      setCreating(false);
    }
  };

  if (!trackerId) {
    return (
      <div className="center-screen">
        <form
          className="stack"
          style={{ alignItems: "center", maxWidth: 480 }}
          onSubmit={handleCreate}
        >
          <h1>{t("newTracker.title")}</h1>
          <p className="muted">{t("newTracker.intro")}</p>

          <label className="stack" style={{ width: "100%" }}>
            {t("newTracker.passwordLabel")}
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder={t("newTracker.passwordPlaceholder")}
              autoComplete="new-password"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? t("newTracker.submitting") : t("newTracker.submit")}
          </button>

          <Link to="/" className="btn">
            {t("common.backToHome")}
          </Link>
        </form>
      </div>
    );
  }

  const url = `${window.location.origin}/trackers/${trackerId}`;

  return (
    <div className="center-screen">
      <div className="stack" style={{ alignItems: "center", maxWidth: 480 }}>
        <h1>{t("newTracker.readyTitle")}</h1>
        <p className="muted">{t("newTracker.readySubtitle")}</p>

        <CopyLink value={url} />

        <QrCode value={url} downloadName={`tracker-${trackerId.slice(0, 8)}`} />

        <Link to={`/trackers/${trackerId}`} className="btn btn-primary">
          {t("newTracker.openTracker")}
        </Link>
      </div>
    </div>
  );
}
