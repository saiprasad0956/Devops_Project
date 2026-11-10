import { TrendingUp } from "lucide-react";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold"><TrendingUp /> SpendWise</div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Take control of your money.</h2>
          <p className="mt-4 max-w-md text-emerald-100">
            Track income and expenses, set monthly budgets and understand where your money goes, all in one dashboard.
          </p>
        </div>
        <p className="text-sm text-emerald-100">Smart Personal Expense Tracker</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900 lg:hidden"><TrendingUp className="text-emerald-600" /> SpendWise</div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}
