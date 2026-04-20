import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  blue:   { icon: 'bg-blue-500/10 text-blue-400',    glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.15)]' },
  green:  { icon: 'bg-emerald-500/10 text-emerald-400', glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' },
  yellow: { icon: 'bg-amber-500/10 text-amber-400',  glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.15)]' },
  red:    { icon: 'bg-red-500/10 text-red-400',      glow: 'shadow-[0_0_0_1px_rgba(239,68,68,0.15)]' },
  gray:   { icon: 'bg-slate-700/50 text-slate-400',  glow: '' },
}

export default function MetricCard({ label, value, sub, color = 'blue', icon: Icon, trend }) {
  const c = colorMap[color] ?? colorMap.blue

  return (
    <div className={`bg-[#0D1525] border border-[#1A2540] rounded-xl p-5 hover:border-[#253552] hover:-translate-y-0.5 transition-all duration-200 ${c.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#334155]">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon size={15} />
          </div>
        )}
      </div>

      <p className="text-3xl font-bold tabular-nums tracking-tight text-white font-mono">
        {value ?? '—'}
      </p>

      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend > 0 && <TrendingUp size={12} className="text-emerald-400" />}
          {trend < 0 && <TrendingDown size={12} className="text-red-400" />}
          {trend === 0 && <Minus size={12} className="text-slate-600" />}
          {sub && <p className="text-xs text-slate-600">{sub}</p>}
        </div>
      )}
    </div>
  )
}
