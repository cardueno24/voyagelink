import { useState } from 'react'
import { AlertTriangle, Plus, ArrowUpDown, Search, X, Package } from 'lucide-react'
import {
  useProducts,
  useAlerts,
  useCreateProduct,
  useUpdateProduct,
  useAddTransaction,
  PAGE_SIZE,
} from '../hooks/useInventory'
import MetricCard from '../components/ui/MetricCard'
import StockBar from '../components/inventory/StockBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
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
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

// ── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({ onClose }) {
  const { mutate, isPending } = useCreateProduct()
  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: '', reorder_point: '', unit_value: '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.sku.trim()) e.sku = 'Required'
    if (form.quantity === '' || isNaN(form.quantity)) e.quantity = 'Must be a number'
    if (form.reorder_point === '' || isNaN(form.reorder_point)) e.reorder_point = 'Must be a number'
    if (form.unit_value === '' || isNaN(form.unit_value)) e.unit_value = 'Must be a number'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    mutate(
      {
        ...form,
        quantity: Number(form.quantity),
        reorder_point: Number(form.reorder_point),
        unit_value: Number(form.unit_value),
      },
      { onSuccess: onClose }
    )
  }

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }))

  return (
    <Modal title="Add Product" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Product Name" required>
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Steel Bracket" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </Field>
          <Field label="SKU" required>
            <input className={inputCls} value={form.sku} onChange={set('sku')} placeholder="e.g. SKU-001" />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
          </Field>
        </div>
        <Field label="Category">
          <input className={inputCls} value={form.category} onChange={set('category')} placeholder="e.g. Hardware" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Qty on Hand" required>
            <input className={inputCls} type="number" min="0" value={form.quantity} onChange={set('quantity')} placeholder="0" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </Field>
          <Field label="Reorder Point" required>
            <input className={inputCls} type="number" min="0" value={form.reorder_point} onChange={set('reorder_point')} placeholder="0" />
            {errors.reorder_point && <p className="text-red-500 text-xs mt-1">{errors.reorder_point}</p>}
          </Field>
          <Field label="Unit Value ($)" required>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.unit_value} onChange={set('unit_value')} placeholder="0.00" />
            {errors.unit_value && <p className="text-red-500 text-xs mt-1">{errors.unit_value}</p>}
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Adjust Stock Modal ───────────────────────────────────────────────────────
function AdjustStockModal({ product, onClose }) {
  const { mutate, isPending } = useAddTransaction()
  const [form, setForm] = useState({ type: 'receipt', quantity: '', note: '' })
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) {
      setError('Enter a valid quantity greater than 0')
      return
    }
    mutate(
      { productId: product.id, ...form, quantity: Number(form.quantity) },
      { onSuccess: onClose }
    )
  }

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }))

  const newQty =
    form.quantity && !isNaN(form.quantity)
      ? form.type === 'receipt'
        ? product.quantity + Number(form.quantity)
        : product.quantity - Number(form.quantity)
      : null

  return (
    <Modal title={`Adjust Stock — ${product.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          Current stock: <span className="font-semibold text-gray-800">{product.quantity}</span>
          {newQty !== null && (
            <span className="ml-2 text-gray-400">
              → <span className={`font-semibold ${newQty < 0 ? 'text-red-600' : 'text-gray-800'}`}>{newQty}</span>
            </span>
          )}
        </div>
        <Field label="Transaction Type">
          <div className="flex gap-2">
            {[['receipt', 'Receipt (add stock)'], ['issue', 'Issue (remove stock)']].map(([val, lbl]) => (
              <label key={val} className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                form.type === val ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
                <input type="radio" name="type" value={val} checked={form.type === val} onChange={set('type')} className="sr-only" />
                {lbl}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Quantity" required>
          <input
            className={inputCls}
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => { setError(''); set('quantity')(e) }}
            placeholder="Enter quantity"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </Field>
        <Field label="Note">
          <input className={inputCls} value={form.note} onChange={set('note')} placeholder="Optional reason or reference" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || (newQty !== null && newQty < 0)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Inventory() {
  const [filters, setFilters] = useState({ category: '', lowStock: false })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [showAdd, setShowAdd] = useState(false)
  const [adjusting, setAdjusting] = useState(null) // product being adjusted

  const { data: products = [], isLoading, error } = useProducts({ ...filters, page })
  const { data: alerts = [] } = useAlerts()

  // Client-side search + sort
  const filtered = products
    .filter((p) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal - bVal
      return sortDir === 'asc' ? cmp : -cmp
    })

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Derived metrics
  const totalValue = products.reduce((sum, p) => sum + (p.quantity ?? 0) * (p.unit_value ?? 0), 0)
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const SortBtn = ({ col }) => (
    <button
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
    >
      <ArrowUpDown size={12} className={sortKey === col ? 'text-blue-500' : ''} />
    </button>
  )

  if (isLoading) return <LoadingSpinner message="Loading inventory…" />
  if (error) return <p className="text-red-500 text-sm">Failed to load inventory.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Low stock alerts banner */}
      {alerts.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">{alerts.length} product{alerts.length > 1 ? 's' : ''} below reorder point:</span>
            <span className="ml-1">{alerts.slice(0, 4).map((a) => a.name).join(', ')}{alerts.length > 4 ? ` +${alerts.length - 4} more` : ''}</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total SKUs" value={products.length} color="gray" />
        <MetricCard
          label="Low Stock"
          value={alerts.length}
          color={alerts.length > 0 ? 'yellow' : 'green'}
        />
        <MetricCard
          label="Inventory Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="blue"
        />
        <MetricCard label="Categories" value={categories.length} color="gray" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1) }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.lowStock}
            onChange={(e) => { setFilters((f) => ({ ...f, lowStock: e.target.checked })); setPage(1) }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Low stock only
        </label>
        {(search || filters.category || filters.lowStock) && (
          <button
            onClick={() => { setSearch(''); setFilters({ category: '', lowStock: false }); setPage(1) }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No products found</p>
            {(search || filters.category || filters.lowStock) && (
              <p className="text-xs mt-1">Try clearing your filters</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="inline-flex items-center gap-1">Name / SKU <SortBtn col="name" /></span>
                </th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">
                  <span className="inline-flex items-center gap-1">Stock <SortBtn col="quantity" /></span>
                </th>
                <th className="px-4 py-3 text-left">Reorder At</th>
                <th className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1">Unit Value <SortBtn col="unit_value" /></span>
                </th>
                <th className="px-4 py-3 text-right">Stock Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const isLow = product.quantity <= product.reorder_point
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-yellow-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</div>
                    </td>
                    <td className="px-4 py-3">
                      {product.category ? (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StockBar current={product.quantity} reorderPoint={product.reorder_point} />
                        {isLow && (
                          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" aria-label="Below reorder point" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.reorder_point ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {product.unit_value != null
                        ? `$${Number(product.unit_value).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {product.unit_value != null && product.quantity != null
                        ? `$${(product.quantity * product.unit_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAdjusting(product)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">
          Page {page} · {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''} on this page
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <button
            disabled={products.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      {adjusting && <AdjustStockModal product={adjusting} onClose={() => setAdjusting(null)} />}
    </div>
  )
}
