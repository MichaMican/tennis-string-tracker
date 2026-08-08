import { useState } from "react";
import { useI18n } from "../i18n/useI18n";

interface Props {
  value: string;
  label?: string;
}

export function CopyLink({ value, label }: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for browsers without clipboard API / insecure contexts.
      const input = document.createElement("textarea");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="row" style={{ width: "100%" }}>
      <input readOnly value={value} onFocus={(e) => e.target.select()} />
      <button type="button" className="btn-primary" onClick={copy}>
        {copied ? t("copy.copied") : (label ?? t("copy.copy"))}
      </button>
    </div>
  );
}
