import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecasting from './pages/Forecasting'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/shipments" element={<div className="text-gray-400 text-sm p-4">Shipments — coming soon</div>} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/ai" element={<div className="text-gray-400 text-sm p-4">AI Assistant — coming soon</div>} />
      </Routes>
    </Layout>
  )
}
