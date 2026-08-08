import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="center-screen">
      <div className="stack" style={{ alignItems: "center", maxWidth: 480 }}>
        <h1>{t("landing.title")}</h1>
        <p className="muted">{t("landing.subtitle")}</p>
        <Link to="/trackers/new" className="btn btn-primary">
          {t("landing.createTracker")}
        </Link>
      </div>
    </div>
  );
}
