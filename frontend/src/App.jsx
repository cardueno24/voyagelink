import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Shipments from './pages/Shipments'
import Forecasting from './pages/Forecasting'
import AIAssistant from './pages/AIAssistant'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/ai" element={<AIAssistant />} />
      </Routes>
    </Layout>
  )
}
