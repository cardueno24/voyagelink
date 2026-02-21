export default function StockBar({ current, reorderPoint }) {
  const pct = reorderPoint > 0 ? Math.min((current / (reorderPoint * 2)) * 100, 100) : 100
  const color = current <= reorderPoint
    ? 'bg-red-500'
    : current <= reorderPoint * 1.5
    ? 'bg-yellow-400'
    : 'bg-green-500'

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{current}</span>
    </div>
  )
}
