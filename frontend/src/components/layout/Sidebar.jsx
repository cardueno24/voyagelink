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
    <aside className="w-56 bg-[#040810] text-white flex flex-col min-h-screen border-r border-[#0D1525] flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#0D1525]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(59,130,246,0.4)]">
            <Anchor size={13} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">VoyageLink</span>
        </div>
        <p className="text-[#1E2D4A] text-[11px] mt-1.5 pl-9 font-medium tracking-wide">Supply Chain AI</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-[#162030] uppercase tracking-[0.12em] px-3 mb-2 mt-1">Menu</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600/[0.12] text-blue-400 active-nav'
                  : 'text-[#334155] hover:bg-white/[0.03] hover:text-slate-300'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-[#0D1525]">
        <p className="text-[#162030] text-[11px] font-medium">© 2025 VoyageLink</p>
      </div>
    </aside>
  )
}
