export default function StockBar({ current, reorderPoint }) {
  const pct = reorderPoint > 0 ? Math.min((current / (reorderPoint * 2)) * 100, 100) : 100
  const color = current <= reorderPoint
    ? 'bg-red-500'
    : current <= reorderPoint * 1.5
    ? 'bg-amber-400'
    : 'bg-emerald-500'

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-24 h-1.5 bg-[#1A2540] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 tabular-nums font-medium">{current}</span>
    </div>
  )
}
