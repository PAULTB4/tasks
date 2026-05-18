import { CategoryTree } from '../categories/CategoryTree'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../../hooks/useAuthStore'
import { LogOut, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface SidebarProps {
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const { user, signOut } = useAuthStore()

  return (
    <aside className="w-72 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col h-full">
      <header className="px-6 py-5 border-b border-surface-200 dark:border-surface-800">
        <h1 className="text-xl font-bold text-brand-700 dark:text-brand-500 tracking-tight">
          TaskForge
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <CategoryTree
          selectedId={selectedCategoryId}
          onSelect={onSelectCategory}
        />
      </div>

      <footer className="border-t border-surface-200 dark:border-surface-800 p-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.email}`}
            alt="User avatar"
            className="w-8 h-8 rounded-full bg-surface-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
              {user?.email}
            </p>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => {}} title="Ajustes">
            <Settings size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} title="Cerrar sesión">
            <LogOut size={18} />
          </Button>
        </div>
      </footer>
    </aside>
  )
}
