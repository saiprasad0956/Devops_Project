import { useEffect, useState } from "react";
import { Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { categoryService, transactionService } from "../services/endpoints";
import { getError } from "../services/api";
import { fmtDate, money } from "../utils/format";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import TransactionForm from "../components/TransactionForm";

const EMPTY = { search: "", type: "", category_id: "", start_date: "", end_date: "" };

export default function Transactions() {
  const [filters, setFilters] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | transaction
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const { data: categories } = useFetch(() => categoryService.list(), []);
  const { data, loading, error, reload } = useFetch(
    () => transactionService.list({ ...filters, search }),
    [search, filters.type, filters.category_id, filters.start_date, filters.end_date]
  );

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, ...(k === "type" ? { category_id: "" } : {}) }));
  const cats = (categories || []).filter((c) => !filters.type || c.type === filters.type);
  const hasFilters = Object.values(filters).some(Boolean);

  const save = async (payload) => {
    if (modal === "new") await transactionService.create(payload);
    else await transactionService.update(modal.id, payload);
    setModal(null);
    reload();
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete this ${t.type} of ${money(t.amount)}?`)) return;
    setActionError("");
    try {
      await transactionService.remove(t.id);
      reload();
    } catch (e) {
      setActionError(getError(e));
    }
  };

  return (
    <>
      <PageHeader title="Transactions" subtitle="Manage your income and expenses">
        <button className="btn-primary" onClick={() => setModal("new")}><Plus className="h-4 w-4" /> Add transaction</button>
      </PageHeader>

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search description or category" value={filters.search} onChange={set("search")} />
        </div>
        <select className="input" value={filters.type} onChange={set("type")}>
          <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select className="input" value={filters.category_id} onChange={set("category_id")}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input" value={filters.start_date} onChange={set("start_date")} title="From date" />
        <input type="date" className="input" value={filters.end_date} onChange={set("end_date")} title="To date" />
        {hasFilters && <button className="btn-secondary sm:col-span-2 lg:col-span-6" onClick={() => { setFilters(EMPTY); setSearch(""); }}>Clear filters</button>}
      </div>

      <ErrorBanner message={actionError} />
      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <div className="p-4"><ErrorBanner message={error} onRetry={reload} /></div> :
          data.length === 0 ? (
            <EmptyState icon={Receipt} title={hasFilters ? "No matching transactions" : "No transactions yet"}
              text={hasFilters ? "Try changing or clearing your filters." : "Add your first income or expense."}
              action={!hasFilters && <button className="btn-primary" onClick={() => setModal("new")}>Add transaction</button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{fmtDate(t.date)}</td>
                      <td className="px-5 py-3 font-medium">{t.description || <span className="text-slate-400">–</span>}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: t.category.color + "22", color: t.category.color }}>
                          {t.category.name}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                        {t.type === "income" ? "+" : "-"}{money(t.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setModal(t)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button className="rounded p-1.5 text-red-500 hover:bg-red-50" onClick={() => remove(t)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Add transaction" : "Edit transaction"} onClose={() => setModal(null)}>
          <TransactionForm initial={modal === "new" ? null : modal} categories={categories || []} onSubmit={save} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}
