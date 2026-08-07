import { useI18n } from "../i18n/useI18n";
import type { Language } from "../i18n/translations";
import { languageNames, languages } from "../i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="sr-only">
        {t("language.label")}
      </label>
      <select
        id="language-select"
        value={language}
        aria-label={t("language.label")}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}
