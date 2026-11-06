import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { categoryService, reportService, transactionService } from "../services/endpoints";
import { getError } from "../services/api";
import useFetch from "../hooks/useFetch";
import { fmtDate, money, startOfMonth, today } from "../utils/format";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import StatCard from "../components/StatCard";

export default function Reports() {
  const [filters, setFilters] = useState({ start_date: startOfMonth(), end_date: today(), type: "", category_id: "" });
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const { data: categories } = useFetch(() => categoryService.list(), []);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, ...(k === "type" ? { category_id: "" } : {}) }));
  const cats = (categories || []).filter((c) => !filters.type || c.type === filters.type);

  const validRange = !filters.start_date || !filters.end_date || filters.start_date <= filters.end_date;

  const generate = async () => {
    if (!validRange) return setError("Start date must be before end date");
    setLoading(true); setError("");
    try { setRows(await transactionService.list({ ...filters, limit: 5000 })); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  };

  const exportCsv = async () => {
    if (!validRange) return setError("Start date must be before end date");
    setExporting(true); setError("");
    try {
      const blob = await reportService.exportCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spendwise_${filters.start_date || "all"}_to_${filters.end_date || "all"}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setError("Could not export CSV. " + getError(e)); }
    finally { setExporting(false); }
  };

  const income = (rows || []).filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = (rows || []).filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export transaction reports">
        <button className="btn-secondary" onClick={exportCsv} disabled={exporting}><Download className="h-4 w-4" /> {exporting ? "Exporting..." : "Export CSV"}</button>
      </PageHeader>

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div><label className="label">From</label><input type="date" className="input" value={filters.start_date} onChange={set("start_date")} /></div>
        <div><label className="label">To</label><input type="date" className="input" value={filters.end_date} onChange={set("end_date")} /></div>
        <div><label className="label">Type</label>
          <select className="input" value={filters.type} onChange={set("type")}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select></div>
        <div><label className="label">Category</label>
          <select className="input" value={filters.category_id} onChange={set("category_id")}><option value="">All</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="flex items-end"><button className="btn-primary w-full" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate report"}</button></div>
      </div>

      <ErrorBanner message={error} />
      {loading ? <Spinner /> : rows === null ? (
        <div className="card"><EmptyState icon={FileText} title="No report generated" text="Choose your filters and click “Generate report”." /></div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <StatCard title="Total income" value={money(income)} tone="green" sub={`${rows.length} transactions`} />
            <StatCard title="Total expenses" value={money(expense)} tone="red" />
            <StatCard title="Net" value={money(income - expense)} tone="indigo" />
          </div>
          <div className="card overflow-hidden">
            {rows.length === 0 ? <EmptyState icon={FileText} title="No transactions found" text="Try a wider date range." /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((t) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap px-5 py-2.5">{fmtDate(t.date)}</td>
                        <td className="px-5 py-2.5 capitalize">{t.type}</td>
                        <td className="px-5 py-2.5">{t.category.name}</td>
                        <td className="px-5 py-2.5 text-slate-600">{t.description || "–"}</td>
                        <td className={`px-5 py-2.5 text-right font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>{money(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
