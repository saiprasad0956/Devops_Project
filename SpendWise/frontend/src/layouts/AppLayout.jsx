import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
    <Link to="/dashboard" className="landing-logo px-1">
      <span className="landing-logo-mark"><TrendingUp size={20} /></span>
      SpendWise
    </Link>
  );
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const firstName = user?.full_name?.split(" ")[0] || "";
  const dateText = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col px-4 py-5">
      <Logo />
      <p className="mb-2 mt-8 px-3 text-xs font-semibold text-slate-400">Menu</p>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}>
            <Icon className="h-[18px] w-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center gap-3">
          <div className="app-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary mt-3 w-full !py-2"><LogOut className="h-4 w-4" /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="app-sidebar fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="app-sidebar absolute inset-y-0 left-0 w-64 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="app-topbar !px-4 sm:!px-8 lg:!h-[68px] max-lg:!h-16">
          <div className="lg:hidden"><Logo /></div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-slate-900">{greeting()}, {firstName}</p>
            <p className="text-xs text-slate-500">{dateText}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 lg:flex">
              <div className="app-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
            </div>
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>
        <main className="app-main min-h-[calc(100vh-68px)]">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
