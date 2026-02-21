import { useDashboard } from '../hooks/useDashboard'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, Truck, CheckCircle2, Clock, Package,
  BarChart3, DollarSign, RefreshCw,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CHART_COLORS = {
  in_transit: '#2563EB',
  delivered:  '#16A34A',
  delayed:    '#DC2626',
  pending:    '#94A3B8',
  customs:    '#7C3AED',
}

const STATUS_LABELS = {
  in_transit: 'In Transit',
  delivered:  'Delivered',
  delayed:    'Delayed',
  pending:    'Pending',
  customs:    'Customs',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <span className="font-semibold text-slate-700">{STATUS_LABELS[name] ?? name}:</span>
      <span className="ml-1.5 text-slate-600 tabular-nums">{value}</span>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4">
      {title}
    </h2>
  )
}

export default function Dashboard() {
  const { data, isLoading, error, dataUpdatedAt, refetch, isFetching } = useDashboard()

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-sm font-medium">Failed to load dashboard data.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    )
  }

  const { shipments, inventory } = data

  const chartData = Object.entries(shipments.by_status)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }))

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
          {lastUpdated && <span>Updated {lastUpdated}</span>}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh dashboard"
            className="ml-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {inventory.alert_count > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-8 text-sm shadow-sm">
          <AlertTriangle size={16} className="flex-shrink-0 text-amber-500" />
          <span>
            <strong className="font-semibold">{inventory.alert_count}</strong>
            {' '}product{inventory.alert_count > 1 ? 's' : ''} below reorder point.{' '}
            <Link to="/inventory" className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors">
              View inventory →
            </Link>
          </span>
        </div>
      )}

      {/* Shipments + Chart Row */}
      <section className="mb-8">
        <SectionHeader title="Shipments" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Metric cards */}
          <div className="xl:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
            <MetricCard label="Total Shipments" value={shipments.total} color="blue" icon={Truck} />
            <MetricCard label="In Transit"      value={shipments.by_status.in_transit} color="blue"  icon={Truck} />
            <MetricCard label="Delivered"       value={shipments.by_status.delivered}  color="green" icon={CheckCircle2} />
            <MetricCard label="Delayed"         value={shipments.by_status.delayed}    color="red"   icon={AlertTriangle} />
          </div>

          {/* Donut chart */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Status Breakdown</p>
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No shipments yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={CHART_COLORS[entry.name] ?? '#CBD5E1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{STATUS_LABELS[value] ?? value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section className="mb-8">
        <SectionHeader title="Inventory" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Total SKUs"       value={inventory.total_skus}                                       color="gray"   icon={Package} />
          <MetricCard label="Low Stock Alerts" value={inventory.alert_count}                                      color={inventory.alert_count > 0 ? 'yellow' : 'green'} icon={AlertTriangle} />
          <MetricCard label="Inventory Value"  value={`$${inventory.total_value?.toLocaleString() ?? '0'}`}       color="gray"   icon={DollarSign} />
        </div>
      </section>

      {/* Recent Shipments Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Recent Shipments" />
          <Link
            to="/shipments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {shipments.recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <BarChart3 size={28} className="text-slate-300" />
              <p className="text-sm">No shipments yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tracking #</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Route</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Carrier</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.recent.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/shipments/${s.id}`}
                        className="font-mono text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
                      >
                        {s.tracking_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">
                      <span className="font-medium">{s.origin}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="font-medium">{s.destination}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{s.carrier}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
