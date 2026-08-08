import { createContext } from "react";
import type { Language, TranslationKey } from "./translations";

export interface I18nContextValue {
  language: Language;
  /** BCP 47 locale for the active language, e.g. `de-DE`. */
  locale: string;
  setLanguage: (language: Language) => void;
  /**
   * Translates a key, replacing `{placeholders}` with the given parameters.
   */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
