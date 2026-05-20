import { useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Menu } from 'lucide-react'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
      {/* Mobile top bar */}
      <header className="sm:hidden flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">TaskForge</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedCategoryId={categoryId || null}
          onSelectCategory={(id) => navigate(`/dashboard/category/${id}`)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
