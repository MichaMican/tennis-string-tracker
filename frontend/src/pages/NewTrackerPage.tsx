import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CopyLink } from "../components/CopyLink";
import { QrCode } from "../components/QrCode";

export function NewTrackerPage() {
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const t = await api.createTracker(editPassword || undefined);
      setTrackerId(t.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create tracker"
      );
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
          <h1>Create a new tracker</h1>
          <p className="muted">
            Optionally protect your tracker with an edit password. Anyone with
            the link can view it, but only people who know the password can
            make changes. The password cannot be recovered later.
          </p>

          <label className="stack" style={{ width: "100%" }}>
            Edit password (optional)
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Leave empty for no protection"
              autoComplete="new-password"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? "Creating…" : "Create tracker"}
          </button>

          <Link to="/" className="btn">
            Back to home
          </Link>
        </form>
      </div>
    );
  }

  const url = `${window.location.origin}/trackers/${trackerId}`;

  return (
    <div className="center-screen">
      <div className="stack" style={{ alignItems: "center", maxWidth: 480 }}>
        <h1>Your tracker is ready</h1>
        <p className="muted">
          Share this link or place the QR code on your racket to open the
          tracker.
        </p>

        <CopyLink value={url} />

        <QrCode value={url} downloadName={`tracker-${trackerId.slice(0, 8)}`} />

        <Link to={`/trackers/${trackerId}`} className="btn btn-primary">
          Open tracker
        </Link>
      </div>
    </div>
  );
}
