import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, List, PlusCircle, BarChart3, UserCircle, Users, Zap, CalendarDays } from 'lucide-react'
import { useLayout } from '../../context/LayoutContext'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/tasks',       icon: Kanban,          label: 'Task Board', exact: true },
  { to: '/tasks/list',  icon: List,            label: 'Task List', exact: true },
  { to: '/tasks/calendar', icon: CalendarDays, label: 'Calendar View', exact: true },
  { to: '/tasks/new',   icon: PlusCircle,      label: 'Create Task', exact: true },
  { to: '/teams',       icon: Users,           label: 'Team Projects', exact: true },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics', exact: true },
  { to: '/profile',     icon: UserCircle,      label: 'Profile', exact: true },
]

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useLayout()

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-[#120f1f]/55 backdrop-blur-[2px]"
        />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-[#5a547d] bg-[#2b2747] shadow-[0_24px_80px_rgba(8,6,18,0.48)] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center border-b border-[#5a547d] px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0c38e] shadow-[0_14px_28px_rgba(240,195,142,0.18)]">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-[#f6efe8]">TaskHub</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          {links.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-[#f0c38e]/30 bg-[#f0c38e]/12 text-[#f7d8af]'
                    : 'text-[#c8c1df] hover:bg-[#3b355f] hover:text-[#f6efe8]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#5a547d] p-4">
          <div className="rounded-2xl border border-[#5f5887] bg-[#343055] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#f0c38e]">AI Risk Analysis On</p>
            <p className="mt-1 text-xs leading-5 text-[#c6bfdc]">Tracking task risk and productivity insights</p>
          </div>
        </div>
      </aside>
    </>
  )
}
