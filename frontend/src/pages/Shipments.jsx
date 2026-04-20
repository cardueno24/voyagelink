import { useState } from 'react'
import { Plus, Search, X, Truck, MapPin, Clock, ChevronRight, Package } from 'lucide-react'
import {
  useShipments,
  useShipment,
  useCreateShipment,
  useAddShipmentEvent,
  PAGE_SIZE,
} from '../hooks/useShipments'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-[#0D1525] border border-[#1E2D4A] rounded-2xl shadow-2xl w-full mx-4 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2540]">
          <h2 className="font-semibold text-slate-200 text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-400 hover:bg-[#141E30] p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Form field helper ────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-[#111827] border border-[#1E2D4A] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all'

const STATUS_OPTIONS = ['pending', 'in_transit', 'customs', 'delivered', 'delayed']

// ── Create Shipment Modal ────────────────────────────────────────────────────
function CreateShipmentModal({ onClose }) {
  const { mutate, isPending } = useCreateShipment()
  const [form, setForm] = useState({
    carrier: '', origin: '', destination: '', cargo_description: '',
    estimated_delivery: '', weight_kg: '', notes: '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.carrier.trim()) e.carrier = 'Required'
    if (!form.origin.trim()) e.origin = 'Required'
    if (!form.destination.trim()) e.destination = 'Required'
    if (form.weight_kg && isNaN(form.weight_kg)) e.weight_kg = 'Must be a number'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    const payload = {
      carrier: form.carrier, origin: form.origin, destination: form.destination,
      cargo_description: form.cargo_description || undefined,
      estimated_delivery: form.estimated_delivery || undefined,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
      notes: form.notes || undefined,
    }
    mutate(payload, { onSuccess: onClose })
  }

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }))

  return (
    <Modal title="Create Shipment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Carrier" required>
          <input className={inputCls} value={form.carrier} onChange={set('carrier')} placeholder="e.g. DHL, FedEx" />
          {errors.carrier && <p className="text-red-400 text-xs mt-1">{errors.carrier}</p>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origin" required>
            <input className={inputCls} value={form.origin} onChange={set('origin')} placeholder="e.g. Shanghai, CN" />
            {errors.origin && <p className="text-red-400 text-xs mt-1">{errors.origin}</p>}
          </Field>
          <Field label="Destination" required>
            <input className={inputCls} value={form.destination} onChange={set('destination')} placeholder="e.g. Los Angeles, US" />
            {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination}</p>}
          </Field>
        </div>
        <Field label="Cargo Description">
          <input className={inputCls} value={form.cargo_description} onChange={set('cargo_description')} placeholder="e.g. Electronic components" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estimated Delivery">
            <input className={`${inputCls} [color-scheme:dark]`} type="date" value={form.estimated_delivery} onChange={set('estimated_delivery')} />
          </Field>
          <Field label="Weight (kg)">
            <input className={inputCls} type="number" min="0" step="0.1" value={form.weight_kg} onChange={set('weight_kg')} placeholder="0.0" />
            {errors.weight_kg && <p className="text-red-400 text-xs mt-1">{errors.weight_kg}</p>}
          </Field>
        </div>
        <Field label="Notes">
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={set('notes')} placeholder="Optional notes" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-[#141E30] rounded-xl transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors font-semibold"
          >
            {isPending ? 'Creating…' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Shipment Detail Modal ────────────────────────────────────────────────────
function ShipmentDetailModal({ shipmentId, onClose }) {
  const { data: shipment, isLoading } = useShipment(shipmentId)
  const { mutate, isPending } = useAddShipmentEvent()
  const [form, setForm] = useState({ status: 'in_transit', location: '', description: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleAddEvent(e) {
    e.preventDefault()
    mutate(
      { shipmentId, ...form },
      {
        onSuccess: () => {
          setForm({ status: 'in_transit', location: '', description: '' })
          setSubmitted(true)
          setTimeout(() => setSubmitted(false), 2000)
        },
      }
    )
  }

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }))

  return (
    <Modal title="Shipment Details" onClose={onClose} wide>
      {isLoading ? (
        <LoadingSpinner message="Loading shipment…" />
      ) : !shipment ? (
        <p className="text-red-400 text-sm">Failed to load shipment.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="bg-[#111827] border border-[#1A2540] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-slate-200">{shipment.tracking_number}</span>
              <StatusBadge status={shipment.status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Truck size={13} className="text-slate-600 flex-shrink-0" />
              <span className="font-medium">{shipment.carrier}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin size={13} className="text-slate-600 flex-shrink-0" />
              <span>{shipment.origin}</span>
              <ChevronRight size={13} className="text-slate-700" />
              <span>{shipment.destination}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
              {shipment.cargo_description && <span><span className="font-semibold text-slate-500">Cargo:</span> {shipment.cargo_description}</span>}
              {shipment.weight_kg && <span><span className="font-semibold text-slate-500">Weight:</span> {shipment.weight_kg} kg</span>}
              {shipment.estimated_delivery && <span><span className="font-semibold text-slate-500">Est. Delivery:</span> {shipment.estimated_delivery}</span>}
              {shipment.actual_delivery && <span><span className="font-semibold text-slate-500">Delivered:</span> {shipment.actual_delivery}</span>}
            </div>
            {shipment.notes && <p className="text-xs text-slate-600 italic mt-0.5">{shipment.notes}</p>}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Tracking History</h3>
            {shipment.events.length === 0 ? (
              <p className="text-sm text-slate-700">No events recorded yet.</p>
            ) : (
              <ol className="relative border-l border-[#1A2540] ml-2 flex flex-col gap-4">
                {[...shipment.events].reverse().map((ev) => (
                  <li key={ev.id} className="ml-4">
                    <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0D1525]" />
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={ev.status} />
                      {ev.location && (
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin size={10} /> {ev.location}
                        </span>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-slate-500">{ev.description}</p>}
                    <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {new Date(ev.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="border-t border-[#1A2540] pt-4">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Add Tracking Event</h3>
            <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select className={`${inputCls} [color-scheme:dark]`} value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Location">
                  <input className={inputCls} value={form.location} onChange={set('location')} placeholder="e.g. Singapore Hub" />
                </Field>
              </div>
              <Field label="Description">
                <input className={inputCls} value={form.description} onChange={set('description')} placeholder="e.g. Package cleared customs" />
              </Field>
              <div className="flex items-center justify-end gap-2">
                {submitted && <span className="text-xs text-emerald-400 font-semibold">Event added!</span>}
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors font-semibold"
                >
                  {isPending ? 'Adding…' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Shipments() {
  const [filters, setFilters] = useState({ status: '', carrier: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const { data: shipments = [], isLoading, error } = useShipments({ ...filters, page })

  const filtered = shipments.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.tracking_number?.toLowerCase().includes(q) ||
      s.carrier?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.cargo_description?.toLowerCase().includes(q)
    )
  })

  const inTransit = shipments.filter((s) => s.status === 'in_transit').length
  const delayed = shipments.filter((s) => s.status === 'delayed').length
  const delivered = shipments.filter((s) => s.status === 'delivered').length

  if (isLoading) return <LoadingSpinner message="Loading shipments…" />
  if (error) return <p className="text-red-400 text-sm">Failed to load shipments.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Shipments</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_16px_rgba(37,99,235,0.25)]"
        >
          <Plus size={16} /> New Shipment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total" value={shipments.length} color="gray" />
        <MetricCard label="In Transit" value={inTransit} color="blue" />
        <MetricCard label="Delayed" value={delayed} color={delayed > 0 ? 'red' : 'gray'} />
        <MetricCard label="Delivered" value={delivered} color="green" />
      </div>

      {delayed > 0 && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/40 text-red-400 px-4 py-3.5 rounded-xl mb-6 text-sm">
          <span className="font-semibold">{delayed} shipment{delayed > 1 ? 's' : ''} delayed</span>
          <span className="text-red-800">—</span>
          <span className="text-red-500/70">Review and update tracking events as needed.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            placeholder="Search by tracking #, carrier, or route…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-[#0D1525] border border-[#1E2D4A] rounded-xl text-slate-300 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1) }}
          className="text-sm bg-[#0D1525] border border-[#1E2D4A] rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all [color-scheme:dark]"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        {(search || filters.status) && (
          <button
            onClick={() => { setSearch(''); setFilters({ status: '', carrier: '' }); setPage(1) }}
            className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0D1525] rounded-xl border border-[#1A2540] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-700">
            <Package size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No shipments found</p>
            {(search || filters.status) && <p className="text-xs mt-1">Try clearing your filters</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#111827]/60 text-slate-600 text-[10px] uppercase border-b border-[#1A2540] tracking-[0.08em] font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Tracking #</th>
                <th className="px-4 py-3 text-left">Carrier</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Est. Delivery</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2540]/60">
              {filtered.map((shipment) => (
                <tr
                  key={shipment.id}
                  className={`hover:bg-white/[0.02] transition-colors ${shipment.status === 'delayed' ? 'bg-red-900/[0.06]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-300">{shipment.tracking_number}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{shipment.carrier}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="truncate max-w-24">{shipment.origin}</span>
                      <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />
                      <span className="truncate max-w-24">{shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {shipment.cargo_description
                      ? <span className="truncate max-w-32 block">{shipment.cargo_description}</span>
                      : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {shipment.estimated_delivery ?? <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={shipment.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetailId(shipment.id)}
                      className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-slate-700">
          Page {page} · {filtered.length} of {shipments.length} shipment{shipments.length !== 1 ? 's' : ''} on this page
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border border-[#1E2D4A] text-slate-500 rounded-lg disabled:opacity-40 hover:bg-[#0D1525] transition-colors"
          >← Prev</button>
          <button
            disabled={shipments.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border border-[#1E2D4A] text-slate-500 rounded-lg disabled:opacity-40 hover:bg-[#0D1525] transition-colors"
          >Next →</button>
        </div>
      </div>

      {showCreate && <CreateShipmentModal onClose={() => setShowCreate(false)} />}
      {detailId && <ShipmentDetailModal shipmentId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
