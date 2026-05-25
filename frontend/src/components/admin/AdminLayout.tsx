import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Users, X, LogOut } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { useAuthStore } from '../../hooks/useAuthStore'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { user } = useAdmin()
  const signOut = useAuthStore((s) => s.signOut)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
      {/* Mobile header */}
      <header className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
        >
          ☰
        </button>
        <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Admin</span>
        <button
          onClick={handleSignOut}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white pt-14 shadow-xl transition-transform duration-200 dark:bg-surface-900 sm:relative sm:translate-x-0 sm:pt-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-4 dark:border-surface-800 sm:hidden">
              <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 border-b border-surface-200 px-4 py-4 dark:border-surface-800">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50">Admin Panel</h3>
                <p className="text-xs text-surface-500">{user?.email}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                        : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-surface-200 px-3 py-4 dark:border-surface-800">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}