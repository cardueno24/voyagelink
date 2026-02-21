import { Clock, Truck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

const config = {
  pending:    { style: 'bg-slate-100 text-slate-600',  icon: Clock,         label: 'Pending' },
  in_transit: { style: 'bg-blue-50 text-blue-700',     icon: Truck,         label: 'In Transit' },
  customs:    { style: 'bg-purple-50 text-purple-700', icon: ShieldCheck,   label: 'Customs' },
  delivered:  { style: 'bg-green-50 text-green-700',   icon: CheckCircle2,  label: 'Delivered' },
  delayed:    { style: 'bg-red-50 text-red-700',       icon: AlertCircle,   label: 'Delayed' },
}

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.style}`}>
      <Icon size={11} />
      {c.label}
    </span>
  )
}
