import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { analyticsService } from "../services/endpoints";
import { EXPENSE_COLOR, INCOME_COLOR, money, toISO } from "../utils/format";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";

function range(period) {
  const d = new Date();
  const end = toISO(d);
  if (period === "month") return { start_date: toISO(new Date(d.getFullYear(), d.getMonth(), 1)), end_date: end };
  if (period === "3m") return { start_date: toISO(new Date(d.getFullYear(), d.getMonth() - 2, 1)), end_date: end };
  if (period === "year") return { start_date: toISO(new Date(d.getFullYear(), 0, 1)), end_date: end };
  return {};
}

const Box = ({ title, children }) => (
  <div className="card p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="h-72">{children}</div></div>
);

export default function Analytics() {
  const [months, setMonths] = useState(6);
  const [period, setPeriod] = useState("3m");
  const monthly = useFetch(() => analyticsService.monthly(months), [months]);
  const cats = useFetch(() => analyticsService.categories({ type: "expense", ...range(period) }), [period]);

  if (monthly.loading && !monthly.data) return <Spinner label="Loading analytics..." />;
  if (monthly.error) return <ErrorBanner message={monthly.error} onRetry={monthly.reload} />;

  const m = monthly.data;
  const active = m.filter((x) => x.expense > 0);
  const avg = active.length ? active.reduce((s, x) => s + x.expense, 0) / active.length : 0;
  const top = active.length ? active.reduce((a, b) => (b.expense > a.expense ? b : a)) : null;
  const inc = m.reduce((s, x) => s + x.income, 0);
  const exp = m.reduce((s, x) => s + x.expense, 0);
  const rate = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
  const empty = m.every((x) => !x.income && !x.expense);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Understand your spending patterns">
        <select className="input !w-auto" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          <option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option>
        </select>
      </PageHeader>

      {empty ? (
        <div className="card"><EmptyState icon={BarChart3} title="Not enough data" text="Add some transactions to see analytics." /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Avg. monthly spending" value={money(avg)} tone="red" />
            <StatCard title="Highest spending month" value={top ? money(top.expense) : "–"} sub={top?.label} tone="amber" />
            <StatCard title="Savings rate" value={`${rate}%`} tone={rate >= 0 ? "green" : "red"} sub={`Over last ${months} months`} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Box title="Monthly spending">
              <ResponsiveContainer><BarChart data={m}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis width={50} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => money(v)} /><Bar dataKey="expense" name="Spending" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </Box>
            <Box title="Income vs expense">
              <ResponsiveContainer><BarChart data={m}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis width={50} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => money(v)} /><Legend /><Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </Box>
            <Box title="Monthly financial trends">
              <ResponsiveContainer><LineChart data={m}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis width={50} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => money(v)} /><Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke={INCOME_COLOR} strokeWidth={2} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke={EXPENSE_COLOR} strokeWidth={2} />
                <Line type="monotone" dataKey="savings" name="Net savings" stroke="#0f766e" strokeWidth={2} strokeDasharray="5 5" /></LineChart></ResponsiveContainer>
            </Box>
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Category-wise spending</h2>
                <select className="input !w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="month">This month</option><option value="3m">Last 3 months</option><option value="year">This year</option><option value="all">All time</option>
                </select>
              </div>
              <div className="h-72">
                {cats.loading ? <Spinner /> : cats.data?.length ? (
                  <ResponsiveContainer><PieChart><Pie data={cats.data} dataKey="total" nameKey="name" outerRadius={95} label={({ percent }) => `${Math.round(percent * 100)}%`}>
                    {cats.data.map((c) => <Cell key={c.category_id} fill={c.color} />)}</Pie><Tooltip formatter={(v) => money(v)} /><Legend /></PieChart></ResponsiveContainer>
                ) : <EmptyState title="No expenses in this period" />}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
