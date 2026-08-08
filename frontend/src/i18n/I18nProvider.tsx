import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { I18nContext } from "./context";
import { resolveInitialLanguage, storeLanguage } from "./language";
import type { Language, TranslationKey } from "./translations";
import { languageLocales, translations } from "./translations";

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    resolveInitialLanguage()
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  const value = useMemo(() => {
    const dictionary = translations[language];
    return {
      language,
      locale: languageLocales[language],
      setLanguage,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        interpolate(dictionary[key] ?? translations.en[key] ?? key, params),
    };
  }, [language, setLanguage]);

  return <I18nContext value={value}>{children}</I18nContext>;
}
