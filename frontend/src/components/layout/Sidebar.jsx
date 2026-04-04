import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Truck, Package, TrendingUp, Bot, Anchor } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/forecasting', label: 'Forecasting', icon: TrendingUp },
  { to: '/ai', label: 'AI Assistant', icon: Bot },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#0F172A] text-white flex flex-col min-h-screen border-r border-slate-800">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Anchor size={14} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'Fira Code', monospace" }}>VoyageLink</span>
        </div>
        <p className="text-slate-500 text-xs mt-1.5 pl-9">Supply Chain AI</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs">© 2025 VoyageLink</p>
      </div>
    </aside>
  )
}
