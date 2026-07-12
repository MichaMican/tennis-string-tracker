import { useState } from "react";
import type { KnottingTechnique, StringEntry, StringEntryInput } from "../api";
import { todayInputValue } from "../utils";

interface Props {
  initial?: StringEntry;
  submitLabel: string;
  onSubmit: (input: StringEntryInput) => Promise<void> | void;
  onCancel?: () => void;
}

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function StringEntryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [horizontal, setHorizontal] = useState(
    initial?.horizontalWeight?.toString() ?? ""
  );
  const [vertical, setVertical] = useState(
    initial?.verticalWeight?.toString() ?? ""
  );
  const [model, setModel] = useState(initial?.stringModel ?? "");
  const [knotting, setKnotting] = useState<string>(
    initial?.knotting?.toString() ?? ""
  );
  const [date, setDate] = useState(
    initial ? initial.dateOfStringing.slice(0, 10) : todayInputValue()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        horizontalWeight: numberOrNull(horizontal),
        verticalWeight: numberOrNull(vertical),
        stringModel: model.trim() === "" ? null : model.trim(),
        knotting: knotting === "" ? null : (Number(knotting) as KnottingTechnique),
        dateOfStringing: new Date(date).toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <label htmlFor="date">Date of stringing</label>
        <input
          id="date"
          type="date"
          value={date}
          required
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid-2">
        <div>
          <label htmlFor="horizontal">Horizontal (cross) weight, kg</label>
          <input
            id="horizontal"
            type="number"
            step="0.1"
            min="0"
            value={horizontal}
            placeholder="e.g. 23"
            onChange={(e) => setHorizontal(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="vertical">Vertical (main) weight, kg</label>
          <input
            id="vertical"
            type="number"
            step="0.1"
            min="0"
            value={vertical}
            placeholder="e.g. 24"
            onChange={(e) => setVertical(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="model">String model / manufacturer</label>
        <input
          id="model"
          value={model}
          placeholder="e.g. Luxilon ALU Power"
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="knotting">Knotting technique</label>
        <select
          id="knotting"
          value={knotting}
          onChange={(e) => setKnotting(e.target.value)}
        >
          <option value="">Not specified</option>
          <option value="2">2 knots</option>
          <option value="4">4 knots</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="row">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
