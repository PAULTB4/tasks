import { CategoryTree } from '../categories/CategoryTree'
import { useAuthStore } from '../../hooks/useAuthStore'

interface SidebarProps {
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const { user, signOut } = useAuthStore()

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-full">
      <div className="px-4 py-5 border-b border-surface-100">
        <h1 className="text-lg font-bold text-brand-700">TaskForge</h1>
      </div>

      <CategoryTree
        selectedId={selectedCategoryId}
        onSelect={onSelectCategory}
      />

      <div className="border-t border-surface-100 p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-surface-400 hover:text-red-500 transition-colors"
            title="Cerrar sesion"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
