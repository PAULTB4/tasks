import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { ListView } from '../components/tasks/ListView'
import { useCategories } from '../hooks/useCategories'

type ViewMode = 'kanban' | 'list'

export function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === categoryId)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  if (!categoryId) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          <p className="text-lg font-medium text-surface-500">Selecciona una categoria</p>
          <p className="text-sm text-surface-400 mt-1">Elegi una categoria del panel izquierdo para ver sus tareas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category?.color || '#6366f1' }}
          />
          <h2 className="text-lg font-semibold text-surface-900">{category?.name || 'Cargando...'}</h2>
        </div>

        <div className="flex bg-surface-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard categoryId={categoryId} />
        ) : (
          <ListView categoryId={categoryId} />
        )}
      </div>
    </div>
  )
}
