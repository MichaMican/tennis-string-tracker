import { useEffect } from "react";

/**
 * Adds a `<meta name="robots" content="noindex, nofollow">` tag while the
 * component is mounted so search engines do not crawl/index tracker pages.
 */
export function useNoIndex(): void {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
