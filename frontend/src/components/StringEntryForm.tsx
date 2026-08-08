import { useState } from "react";
import type { KnottingTechnique, StringEntry, StringEntryInput } from "../api";
import { todayInputValue } from "../utils";
import { useI18n } from "../i18n/useI18n";

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
  const { t } = useI18n();
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
      setError(
        err instanceof Error ? err.message : t("common.somethingWentWrong")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <label htmlFor="date">{t("form.date")}</label>
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
          <label htmlFor="horizontal">{t("form.horizontal")}</label>
          <input
            id="horizontal"
            type="number"
            step="0.1"
            min="0"
            value={horizontal}
            placeholder={t("form.examplePlaceholder", { value: 23 })}
            onChange={(e) => setHorizontal(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="vertical">{t("form.vertical")}</label>
          <input
            id="vertical"
            type="number"
            step="0.1"
            min="0"
            value={vertical}
            placeholder={t("form.examplePlaceholder", { value: 24 })}
            onChange={(e) => setVertical(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="model">{t("form.model")}</label>
        <input
          id="model"
          value={model}
          placeholder={t("form.modelPlaceholder")}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="knotting">{t("form.knotting")}</label>
        <select
          id="knotting"
          value={knotting}
          onChange={(e) => setKnotting(e.target.value)}
        >
          <option value="">{t("form.knottingNone")}</option>
          <option value="2">{t("knotting.2")}</option>
          <option value="4">{t("knotting.4")}</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="row">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? t("form.saving") : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy}>
            {t("common.cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
