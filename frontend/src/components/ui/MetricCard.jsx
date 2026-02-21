import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  blue:   { card: 'bg-white border-slate-200', icon: 'bg-blue-50 text-blue-600',   value: 'text-[#1E293B]', label: 'text-slate-500' },
  green:  { card: 'bg-white border-slate-200', icon: 'bg-green-50 text-green-600', value: 'text-[#1E293B]', label: 'text-slate-500' },
  yellow: { card: 'bg-white border-slate-200', icon: 'bg-amber-50 text-amber-600', value: 'text-[#1E293B]', label: 'text-slate-500' },
  red:    { card: 'bg-white border-slate-200', icon: 'bg-red-50 text-red-600',     value: 'text-[#1E293B]', label: 'text-slate-500' },
  gray:   { card: 'bg-white border-slate-200', icon: 'bg-slate-100 text-slate-500', value: 'text-[#1E293B]', label: 'text-slate-500' },
}

export default function MetricCard({ label, value, sub, color = 'blue', icon: Icon, trend }) {
  const c = colorMap[color] ?? colorMap.blue

  return (
    <div className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${c.card}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon size={15} />
          </div>
        )}
      </div>

      <p className={`text-3xl font-bold tabular-nums tracking-tight ${c.value}`} style={{ fontFamily: "'Fira Code', monospace" }}>
        {value ?? '—'}
      </p>

      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend > 0 && <TrendingUp size={12} className="text-green-500" />}
          {trend < 0 && <TrendingDown size={12} className="text-red-500" />}
          {trend === 0 && <Minus size={12} className="text-slate-400" />}
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      )}
    </div>
  )
}
