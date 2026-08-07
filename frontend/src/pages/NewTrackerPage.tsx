import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CopyLink } from "../components/CopyLink";
import { QrCode } from "../components/QrCode";

export function NewTrackerPage() {
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode invoking the effect twice in development,
    // which would otherwise create two trackers.
    if (started.current) return;
    started.current = true;

    api
      .createTracker()
      .then((t) => setTrackerId(t.id))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to create tracker")
      );
  }, []);

  if (error) {
    return (
      <div className="center-screen">
        <p className="error">{error}</p>
        <Link to="/" className="btn">
          Back to home
        </Link>
      </div>
    );
  }

  if (!trackerId) {
    return (
      <div className="center-screen">
        <p className="muted">Creating your tracker…</p>
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
