export default function StatCard({ title, value, icon: Icon, tone = "green", sub }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && <span className={`stat-icon ${tones[tone]}`}><Icon className="h-5 w-5" /></span>}
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-2.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
