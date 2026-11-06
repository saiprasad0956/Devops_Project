import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, PieChart as PieIcon, Receipt, Wallet } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { analyticsService } from "../services/endpoints";
import { EXPENSE_COLOR, INCOME_COLOR, fmtDate, money } from "../utils/format";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(() => analyticsService.dashboard(), []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  const d = data;
  const status = d.budget_utilization >= 100 ? "exceeded" : d.budget_utilization >= 80 ? "warning" : "ok";
  const hasMonthly = d.monthly.some((m) => m.income || m.expense);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your financial overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Balance" value={money(d.total_balance)} icon={Wallet} tone="indigo" sub="All-time income minus expenses" />
        <StatCard title="Total Income" value={money(d.total_income)} icon={ArrowUpCircle} tone="green" sub={`${money(d.month_income)} this month`} />
        <StatCard title="Total Expenses" value={money(d.total_expenses)} icon={ArrowDownCircle} tone="red" sub={`${money(d.month_expenses)} this month`} />
      </div>

      <div className="card mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Budget utilization (this month)</h2>
          <Link to="/budgets" className="text-sm font-medium text-indigo-600">Manage budgets</Link>
        </div>
        {d.monthly_budget > 0 ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div><p className="text-sm text-slate-500">Monthly budget</p><p className="text-xl font-bold">{money(d.monthly_budget)}</p></div>
              <div><p className="text-sm text-slate-500">Spent</p><p className="text-xl font-bold">{money(d.month_expenses)}</p></div>
              <div>
                <p className="text-sm text-slate-500">Remaining</p>
                <p className={`text-xl font-bold ${d.remaining_budget < 0 ? "text-red-600" : "text-emerald-600"}`}>{money(d.remaining_budget)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm"><span className="text-slate-500">Used</span><span className="font-medium">{d.budget_utilization}%</span></div>
              <ProgressBar percentage={d.budget_utilization} status={status} />
              {status !== "ok" && (
                <p className={`mt-2 text-sm ${status === "exceeded" ? "text-red-600" : "text-amber-600"}`}>
                  {status === "exceeded" ? "You have exceeded your monthly budget." : "You are close to your monthly budget limit."}
                </p>
              )}
            </div>
          </>
        ) : (
          <EmptyState icon={PieIcon} title="No budget set for this month" text="Create a monthly budget to track your spending."
            action={<Link to="/budgets" className="btn-primary">Create budget</Link>} />
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h2 className="mb-4 font-semibold">Monthly income vs expense</h2>
          {hasMonthly ? (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={d.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={50} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={Receipt} title="No data yet" text="Add transactions to see your trends." />}
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Expenses by category (this month)</h2>
          {d.categories.length ? (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={d.categories} dataKey="total" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {d.categories.map((c) => <Cell key={c.category_id} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={PieIcon} title="No expenses this month" />}
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="font-semibold">Recent transactions</h2>
          <Link to="/transactions" className="text-sm font-medium text-indigo-600">View all</Link>
        </div>
        {d.recent_transactions.length ? (
          <ul className="divide-y divide-slate-100">
            {d.recent_transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-9 w-9 shrink-0 rounded-full" style={{ backgroundColor: t.category.color + "33", border: `2px solid ${t.category.color}` }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.description || t.category.name}</p>
                    <p className="text-xs text-slate-500">{t.category.name} · {fmtDate(t.date)}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                  {t.type === "income" ? "+" : "-"}{money(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Receipt} title="No transactions yet" text="Add your first transaction to get started."
            action={<Link to="/transactions" className="btn-primary">Add transaction</Link>} />
        )}
      </div>
    </>
  );
}
