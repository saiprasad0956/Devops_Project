export default function ProgressBar({ percentage, status }) {
  const color = status === "exceeded" ? "bg-red-400" : status === "warning" ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  );
}
