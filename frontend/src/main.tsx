import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { LandingPage } from "./pages/LandingPage";
import { NewTrackerPage } from "./pages/NewTrackerPage";
import { TrackerPage } from "./pages/TrackerPage";
import { HistoryPage } from "./pages/HistoryPage";
import { StringerPage } from "./pages/StringerPage";
import { VersionFooter } from "./components/VersionFooter";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { I18nProvider } from "./i18n/I18nProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <LanguageSwitcher />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trackers/new" element={<NewTrackerPage />} />
          <Route path="/trackers/:id" element={<TrackerPage />} />
          <Route path="/trackers/:id/history" element={<HistoryPage />} />
          <Route path="/stringer" element={<StringerPage />} />
        </Routes>
        <VersionFooter />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>
);
