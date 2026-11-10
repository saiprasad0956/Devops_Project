import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
