import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Truck, Package, TrendingUp, Bot } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/forecasting', label: 'Forecasting', icon: TrendingUp },
  { to: '/ai', label: 'AI Assistant', icon: Bot },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">⚓</span>
          <span className="font-bold text-lg tracking-tight">VoyageLink</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Supply Chain AI</p>
      </div>
      <nav className="flex-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
