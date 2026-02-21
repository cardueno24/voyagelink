import { useDashboard } from '../hooks/useDashboard'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />
  if (error) return <p className="text-red-500">Failed to load dashboard.</p>

  const { shipments, inventory } = data

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {inventory.alert_count > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
          <AlertTriangle size={16} />
          <span>
            <strong>{inventory.alert_count}</strong> product{inventory.alert_count > 1 ? 's' : ''} below reorder point.{' '}
            <Link to="/inventory" className="underline font-semibold">View inventory</Link>
          </span>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Shipments</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total" value={shipments.total} color="blue" />
          <MetricCard label="In Transit" value={shipments.by_status.in_transit} color="blue" />
          <MetricCard label="Delivered" value={shipments.by_status.delivered} color="green" />
          <MetricCard label="Delayed" value={shipments.by_status.delayed} color="red" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Inventory</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="Total SKUs" value={inventory.total_skus} color="gray" />
          <MetricCard label="Low Stock Alerts" value={inventory.alert_count} color={inventory.alert_count > 0 ? 'yellow' : 'green'} />
          <MetricCard label="Inventory Value" value={`$${inventory.total_value.toLocaleString()}`} color="gray" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Shipments</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {shipments.recent.length === 0 ? (
            <p className="text-gray-400 text-sm p-5">No shipments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tracking</th>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-left">Carrier</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.recent.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link to={`/shipments/${s.id}`} className="text-blue-600 hover:underline">{s.tracking_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.origin} → {s.destination}</td>
                    <td className="px-4 py-3 text-gray-600">{s.carrier}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
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
