import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="center-screen">
      <div className="stack" style={{ alignItems: "center", maxWidth: 480 }}>
        <h1>Tennis String Tracker</h1>
        <p className="muted">
          Keep a history of every string change on your racket and share it with
          a simple QR code.
        </p>
        <Link to="/trackers/new" className="btn btn-primary">
          Create tracker
        </Link>
      </div>
    </div>
  );
}
