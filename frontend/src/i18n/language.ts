import type { Language } from "./translations";
import { defaultLanguage, languages } from "./translations";

export const LANGUAGE_STORAGE_KEY = "tst.language";

function isSupported(value: string | null | undefined): value is Language {
  return (
    value !== null &&
    value !== undefined &&
    (languages as readonly string[]).includes(value)
  );
}

/** Maps a BCP 47 tag such as `de-AT` to a supported language, if possible. */
function toSupported(tag: string): Language | null {
  const normalized = tag.toLowerCase();
  if (isSupported(normalized)) return normalized;
  const base = normalized.split("-")[0];
  return isSupported(base) ? base : null;
}

/** Reads the manually selected language from local storage, if any. */
export function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupported(stored) ? stored : null;
  } catch {
    // Local storage can be unavailable (private mode, disabled cookies).
    return null;
  }
}

export function storeLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore – the language then simply is not persisted.
  }
}

/** Language from the browser/system settings, or `null` if unsupported. */
export function detectBrowserLanguage(): Language | null {
  if (typeof navigator === "undefined") return null;
  const tags =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
  for (const tag of tags) {
    const match = toSupported(tag);
    if (match) return match;
  }
  return null;
}

/**
 * Resolves the initial language: a manual selection wins over the system
 * language; unsupported languages fall back to English.
 */
export function resolveInitialLanguage(): Language {
  return readStoredLanguage() ?? detectBrowserLanguage() ?? defaultLanguage;
}
