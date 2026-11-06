import { useState } from "react";
import { getError } from "../services/api";
import { today } from "../utils/format";
import Field from "./Field";
import ErrorBanner from "./ErrorBanner";

export default function TransactionForm({ initial, categories, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type: initial?.type || "expense",
    amount: initial?.amount ?? "",
    category_id: initial?.category_id || "",
    date: initial?.date || today(),
    description: initial?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cats = categories.filter((c) => c.type === form.type);

  const validate = () => {
    const e = {};
    if (!/^\d+(\.\d{1,2})?$/.test(String(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a positive amount (max 2 decimals)";
    if (!form.category_id) e.category_id = "Select a category";
    if (!form.date) e.date = "Select a date";
    if (form.description.length > 255) e.description = "Max 255 characters";
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
        type: form.type,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
        date: form.date,
        description: form.description.trim() || null,
      });
    } catch (err) {
      setApiError(getError(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <ErrorBanner message={apiError} />
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {["expense", "income"].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setForm((f) => ({ ...f, type: t, category_id: "" }))}
            className={`rounded-md py-1.5 text-sm font-medium capitalize transition ${
              form.type === t ? (t === "income" ? "bg-emerald-600 text-white" : "bg-red-500 text-white") : "text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <Field label="Amount" error={errors.amount}>
        <input className={`input ${errors.amount ? "input-error" : ""}`} inputMode="decimal" placeholder="0.00"
          value={form.amount} onChange={(e) => set("amount", e.target.value)} />
      </Field>
      <Field label="Category" error={errors.category_id}>
        <select className={`input ${errors.category_id ? "input-error" : ""}`} value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}>
          <option value="">Select category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Date" error={errors.date}>
        <input type="date" className={`input ${errors.date ? "input-error" : ""}`} value={form.date}
          onChange={(e) => set("date", e.target.value)} />
      </Field>
      <Field label="Description (optional)" error={errors.description}>
        <input className="input" placeholder="e.g. Groceries" value={form.description}
          onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
