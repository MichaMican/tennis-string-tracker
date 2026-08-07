import { useState } from "react";

interface Props {
  value: string;
  label?: string;
}

export function CopyLink({ value, label = "Copy link" }: Props) {
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
        {copied ? "Copied!" : label}
      </button>
    </div>
  );
}
