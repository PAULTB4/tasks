import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { ListView } from '../components/tasks/ListView'
import { FolderChildrenGrid } from '../components/categories/FolderChildrenGrid'
import { useCategories } from '../hooks/useCategories'
import { LayoutGrid, List, Folder } from 'lucide-react'

type ViewMode = 'kanban' | 'list'

export function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === categoryId)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  if (!categoryId) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400 dark:text-surface-600">
        <div className="text-center p-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl">
          <Folder size={48} className="mx-auto text-surface-300 dark:text-surface-700" />
          <p className="mt-4 text-lg font-medium text-surface-600 dark:text-surface-400">
            Seleccioná una carpeta o lista
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-500 mt-1">
            Elegí una del panel izquierdo para ver su contenido.
          </p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-surface-400">Cargando...</p>
      </div>
    )
  }

  if (category.type === 'folder') {
    return (
      <div className="h-full flex flex-col bg-surface-50 dark:bg-surface-900">
        <header className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Folder size={20} className="text-amber-500" />
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
              {category.name}
            </h2>
            <span className="text-xs font-medium text-surface-400 bg-surface-200 dark:bg-surface-800 px-2 py-0.5 rounded-full">
              Carpeta
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <FolderChildrenGrid categoryId={categoryId} />
        </main>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-surface-50 dark:bg-surface-900">
      <header className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <List size={20} className="text-brand-500" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
            {category.name}
          </h2>
        </div>

        <div className="flex items-center bg-surface-200 dark:bg-surface-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-white'
                : 'text-surface-500 hover:text-surface-800 dark:hover:text-white'
            }`}
            aria-label="Vista Kanban"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-white'
                : 'text-surface-500 hover:text-surface-800 dark:hover:text-white'
            }`}
            aria-label="Vista de Lista"
          >
            <List size={20} />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard categoryId={categoryId} />
        ) : (
          <ListView categoryId={categoryId} />
        )}
      </main>
    </div>
  )
}
