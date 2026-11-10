export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {Icon && (
        <div className="mb-3 rounded-full bg-emerald-50 p-3 text-emerald-600">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
