import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, FileText, LayoutDashboard, LogOut, Menu, PieChart, Receipt, TrendingUp, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: PieChart },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="rounded-lg bg-emerald-600 p-1.5 text-white"><TrendingUp className="h-5 w-5" /></div>
      <span className="text-lg font-bold tracking-tight text-slate-900">SpendWise</span>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-white p-4">
      <Logo />
      <nav className="mt-8 flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary w-full"><LogOut className="h-4 w-4" /> Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Logo />
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
