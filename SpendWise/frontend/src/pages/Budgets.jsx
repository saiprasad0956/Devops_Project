import { useState } from "react";
import { AlertTriangle, Pencil, PieChart, Plus, Trash2 } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { budgetService, categoryService } from "../services/endpoints";
import { getError } from "../services/api";
import { MONTHS, money } from "../utils/format";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import ProgressBar from "../components/ProgressBar";
import BudgetForm from "../components/BudgetForm";

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [modal, setModal] = useState(null);
  const [actionError, setActionError] = useState("");

  const { data: categories } = useFetch(() => categoryService.list(), []);
  const { data, loading, error, reload } = useFetch(() => budgetService.list({ month, year }), [month, year]);

  const save = async (payload) => {
    if (modal === "new") await budgetService.create(payload);
    else await budgetService.update(modal.id, payload);
    setModal(null);
    if (payload.month !== month || payload.year !== year) { setMonth(payload.month); setYear(payload.year); }
    else reload();
  };

  const remove = async (b) => {
    if (!window.confirm("Delete this budget?")) return;
    setActionError("");
    try { await budgetService.remove(b.id); reload(); } catch (e) { setActionError(getError(e)); }
  };

  const alerts = (data || []).filter((b) => b.status !== "ok");
  const name = (b) => (b.category ? b.category.name : "Overall budget");

  return (
    <>
      <PageHeader title="Budgets" subtitle="Plan and track your monthly spending">
        <select className="input !w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" className="input !w-24" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} />
        <button className="btn-primary" onClick={() => setModal("new")}><Plus className="h-4 w-4" /> New budget</button>
      </PageHeader>

      <ErrorBanner message={actionError} />
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((b) => (
            <div key={b.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${b.status === "exceeded" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>{name(b)}</b>: {b.status === "exceeded" ? `over budget by ${money(Math.abs(b.remaining))}` : `${b.percentage}% used, only ${money(b.remaining)} left`}.
              </span>
            </div>
          ))}
        </div>
      )}

      {loading ? <Spinner /> : error ? <ErrorBanner message={error} onRetry={reload} /> :
        data.length === 0 ? (
          <div className="card">
            <EmptyState icon={PieChart} title={`No budgets for ${MONTHS[month - 1]} ${year}`} text="Create a budget for a category or an overall monthly limit."
              action={<button className="btn-primary" onClick={() => setModal("new")}>Create budget</button>} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((b) => (
              <div key={b.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: b.category?.color || "#059669" }} />
                    <h3 className="font-semibold">{name(b)}</h3>
                  </div>
                  <div className="flex">
                    <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setModal(b)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 text-red-500 hover:bg-red-50" onClick={() => remove(b)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold">{money(b.spent)} <span className="text-sm font-normal text-slate-500">of {money(b.amount)}</span></p>
                <div className="mt-3"><ProgressBar percentage={b.percentage} status={b.status} /></div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">{b.percentage}% used</span>
                  <span className={b.remaining < 0 ? "font-medium text-red-600" : "text-slate-600"}>
                    {b.remaining < 0 ? `${money(-b.remaining)} over` : `${money(b.remaining)} left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal && (
        <Modal title={modal === "new" ? "New budget" : "Edit budget"} onClose={() => setModal(null)}>
          <BudgetForm initial={modal === "new" ? null : modal} categories={categories || []} defaultMonth={month} defaultYear={year}
            onSubmit={save} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}
