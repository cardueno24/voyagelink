import { useState, useMemo } from 'react'
import { TrendingUp, Cpu, AlertTriangle, ChevronDown } from 'lucide-react'
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useProducts, useProduct } from '../hooks/useInventory'
import { useForecast } from '../hooks/useForecast'
import MetricCard from '../components/ui/MetricCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// ── Data helpers ─────────────────────────────────────────────────────────────

function netQty(tx) {
  return tx.transaction_type === 'issue' ? -Math.abs(tx.quantity) : Math.abs(tx.quantity)
}

function buildStockHistory(transactions, currentStock) {
  if (!transactions?.length) return []
  const sorted = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const points = []
  let stock = currentStock
  for (const tx of sorted) {
    points.unshift({
      date: new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      stock,
    })
    stock -= netQty(tx)
  }
  return points
}

function buildWeeklyVolume(transactions) {
  const weekly = {}
  for (const tx of transactions) {
    const d = new Date(tx.timestamp)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!weekly[key]) weekly[key] = { week: key, receipts: 0, issues: 0, _ts: monday.getTime() }
    if (tx.transaction_type === 'issue') weekly[key].issues += Math.abs(tx.quantity)
    else weekly[key].receipts += Math.abs(tx.quantity)
  }
  return Object.values(weekly).sort((a, b) => a._ts - b._ts)
}

function buildProjection(transactions, currentStock, reorderPoint, leadTimeDays) {
  const issues = transactions.filter((tx) => tx.transaction_type === 'issue')
  const totalIssued = issues.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0)

  let daySpan = 1
  if (transactions.length > 1) {
    const timestamps = transactions.map((tx) => new Date(tx.timestamp).getTime())
    daySpan = Math.max(1, (Math.max(...timestamps) - Math.min(...timestamps)) / 86400000)
  }

  const avgDaily = totalIssued / daySpan
  const today = new Date()
  const points = []

  for (let i = 0; i <= 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    points.push({
      day: i === 0 ? 'Today' : `Day ${i}`,
      projected: Math.max(0, Math.round(currentStock - avgDaily * i)),
      reorderPoint,
      safetyBuffer: leadTimeDays ? Math.round(avgDaily * leadTimeDays) : null,
    })
  }

  return { points, avgDaily: avgDaily.toFixed(1) }
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit = 'units' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value} {unit}</span>
        </p>
      ))}
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Empty chart placeholder ───────────────────────────────────────────────────

function EmptyChart({ message = 'No transaction history yet' }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
      {message}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Forecasting() {
  const [selectedId, setSelectedId] = useState('')
  const { data: products = [], isLoading: loadingProducts } = useProducts()
  const { data: product, isLoading: loadingProduct } = useProduct(selectedId || null)
  const { mutate: runForecast, data: forecastResult, isPending: forecastLoading, reset: resetForecast } = useForecast()

  const transactions = product?.transactions ?? []

  const stockHistory = useMemo(
    () => buildStockHistory(transactions, product?.current_stock ?? 0),
    [transactions, product?.current_stock]
  )

  const weeklyVolume = useMemo(() => buildWeeklyVolume(transactions), [transactions])

  const { points: projectionPoints, avgDaily } = useMemo(
    () =>
      product
        ? buildProjection(transactions, product.current_stock, product.reorder_point, product.lead_time_days)
        : { points: [], avgDaily: '—' },
    [transactions, product]
  )

  const isLowStock = product && product.current_stock <= product.reorder_point

  function handleProductChange(e) {
    setSelectedId(e.target.value)
    resetForecast()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Demand Forecasting</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visualize stock trends and generate AI-powered forecasts</p>
        </div>
      </div>

      {/* Product selector */}
      <div className="mb-6">
        {loadingProducts ? (
          <div className="h-10 w-72 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <div className="relative inline-block">
            <select
              value={selectedId}
              onChange={handleProductChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-72 cursor-pointer"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* No selection state */}
      {!selectedId && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <TrendingUp size={48} className="mb-4 opacity-40" />
          <p className="text-sm font-medium text-gray-400">Select a product to view its forecast</p>
        </div>
      )}

      {/* Loading product */}
      {selectedId && loadingProduct && <LoadingSpinner message="Loading product data…" />}

      {/* Product loaded */}
      {selectedId && product && (
        <>
          {/* Low stock alert */}
          {isLowStock && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
              <AlertTriangle size={15} />
              <span>
                <strong>{product.name}</strong> is below its reorder point ({product.reorder_point} units).
              </span>
            </div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Current Stock"
              value={product.current_stock}
              sub="units on hand"
              color={isLowStock ? 'red' : 'blue'}
            />
            <MetricCard
              label="Reorder Point"
              value={product.reorder_point}
              sub="units threshold"
              color="yellow"
            />
            <MetricCard
              label="Lead Time"
              value={`${product.lead_time_days}d`}
              sub={product.supplier ?? 'supplier'}
              color="gray"
            />
            <MetricCard
              label="Avg Daily Use"
              value={transactions.length ? `${avgDaily} u/day` : '—'}
              sub={transactions.length ? 'based on history' : 'no history yet'}
              color="gray"
            />
          </div>

          {/* Charts row: Stock History + Weekly Volume */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Stock History – 2/3 width */}
            <ChartCard
              title="Stock Level History"
              subtitle="Reconstructed from transaction log"
              className="md:col-span-2"
            >
              <div className="md:col-span-2">
                {stockHistory.length < 2 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stockHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={product.reorder_point} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'Reorder', fontSize: 9, fill: '#f59e0b' }} />
                      <Area type="monotone" dataKey="stock" name="Stock" stroke="#2563eb" strokeWidth={2} fill="url(#stockGrad)" dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            {/* Weekly Volume */}
            <ChartCard title="Weekly Transaction Volume" subtitle="Receipts vs. issues by week">
              {weeklyVolume.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyVolume} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Bar dataKey="receipts" name="Receipts" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="issues" name="Issues" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* 30-Day Projection */}
          <div className="mb-6">
            <ChartCard
              title="30-Day Stock Projection"
              subtitle={`Estimated at ${avgDaily} units/day based on transaction history`}
            >
              {projectionPoints.length === 0 || transactions.length === 0 ? (
                <EmptyChart message="No transaction history to project from" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={projectionPoints} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={product.reorder_point} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'Reorder point', fontSize: 9, fill: '#f59e0b', position: 'insideTopRight' }} />
                    {projectionPoints[0]?.safetyBuffer != null && (
                      <ReferenceLine y={projectionPoints[0].safetyBuffer} stroke="#a78bfa" strokeDasharray="4 3" label={{ value: 'Safety buffer', fontSize: 9, fill: '#a78bfa', position: 'insideBottomRight' }} />
                    )}
                    <Line type="monotone" dataKey="projected" name="Projected stock" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* AI Forecast */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">AI Demand Forecast</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Powered by AI — analyzes transaction history to generate a 30-day forecast
                </p>
              </div>
              <button
                onClick={() => runForecast(product.id)}
                disabled={forecastLoading}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Cpu size={14} />
                {forecastLoading ? 'Generating…' : forecastResult ? 'Regenerate' : 'Generate Forecast'}
              </button>
            </div>

            {forecastLoading && (
              <div className="flex items-center gap-3 text-sm text-gray-400 py-6 justify-center">
                <span className="inline-block w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Analyzing transaction data…
              </div>
            )}

            {!forecastLoading && forecastResult && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {forecastResult.forecast}
                </pre>
              </div>
            )}

            {!forecastLoading && !forecastResult && (
              <div className="flex items-center justify-center py-10 text-gray-300">
                <p className="text-sm">Click "Generate Forecast" to get an AI-powered demand analysis</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
