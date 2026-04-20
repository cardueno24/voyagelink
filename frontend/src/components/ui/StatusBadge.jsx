import { Clock, Truck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

const config = {
  pending:    { style: 'bg-slate-800/60 text-slate-400 ring-1 ring-slate-700/60',           icon: Clock,        label: 'Pending' },
  in_transit: { style: 'bg-blue-900/40 text-blue-400 ring-1 ring-blue-700/40',               icon: Truck,        label: 'In Transit' },
  customs:    { style: 'bg-violet-900/40 text-violet-400 ring-1 ring-violet-700/40',         icon: ShieldCheck,  label: 'Customs' },
  delivered:  { style: 'bg-emerald-900/40 text-emerald-400 ring-1 ring-emerald-700/40',      icon: CheckCircle2, label: 'Delivered' },
  delayed:    { style: 'bg-red-900/40 text-red-400 ring-1 ring-red-700/40',                  icon: AlertCircle,  label: 'Delayed' },
}

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-semibold tracking-wide ${c.style}`}>
      <Icon size={10} />
      {c.label}
    </span>
  )
}
