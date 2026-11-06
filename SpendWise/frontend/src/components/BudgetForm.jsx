import { useState } from "react";
import { getError } from "../services/api";
import { MONTHS } from "../utils/format";
import Field from "./Field";
import ErrorBanner from "./ErrorBanner";

export default function BudgetForm({ initial, categories, defaultMonth, defaultYear, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    category_id: initial ? initial.category_id ?? "overall" : "",
    amount: initial?.amount ?? "",
    month: initial?.month ?? defaultMonth,
    year: initial?.year ?? defaultYear,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (form.category_id === "") e.category_id = "Choose a category or overall budget";
    if (!/^\d+(\.\d{1,2})?$/.test(String(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a positive amount (max 2 decimals)";
    if (!form.year || form.year < 2000 || form.year > 2100) e.year = "Enter a valid year";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError("");
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        category_id: form.category_id === "overall" ? null : Number(form.category_id),
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
      });
    } catch (err) {
      setApiError(getError(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <ErrorBanner message={apiError} />
      <Field label="Category" error={errors.category_id}>
        <select className={`input ${errors.category_id ? "input-error" : ""}`} value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}>
          <option value="">Select...</option>
          <option value="overall">Overall monthly budget (all categories)</option>
          {categories.filter((c) => c.type === "expense").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Budget amount" error={errors.amount}>
        <input className={`input ${errors.amount ? "input-error" : ""}`} inputMode="decimal" placeholder="0.00"
          value={form.amount} onChange={(e) => set("amount", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Month">
          <select className="input" value={form.month} onChange={(e) => set("month", e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </Field>
        <Field label="Year" error={errors.year}>
          <input type="number" className="input" value={form.year} onChange={(e) => set("year", e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create budget"}
        </button>
      </div>
    </form>
  );
}
