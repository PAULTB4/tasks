import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import type { Category } from '../../types'

function CategoryNode({
  category,
  children,
  selectedId,
  onSelect,
  level = 0,
}: {
  category: Category
  children: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
  level: number
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => onSelect(category.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          selectedId === category.id
            ? 'bg-brand-50 text-brand-700 font-medium'
            : 'text-surface-700 hover:bg-surface-100'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {children.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="text-surface-400 hover:text-surface-600 text-xs"
          >
            {expanded ? '▾' : '▸'}
          </span>
        )}
        {children.length === 0 && <span className="w-3" />}
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color || '#6366f1' }}
        />
        <span className="truncate">{category.name}</span>
      </button>
      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              children={[]}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoryTreeProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CategoryTree({ selectedId, onSelect }: CategoryTreeProps) {
  const { data: categories, isLoading, createCategory, deleteCategory } = useCategories()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)

  const rootCategories = categories?.filter((c) => !c.parent_id) ?? []
  const getChildren = (parentId: string) => categories?.filter((c) => c.parent_id === parentId) ?? []

  const handleCreate = (name: string, color: string, parentId?: string | null) => {
    createCategory.mutate({ name, color, parent_id: parentId ?? null }, {
      onSuccess: () => setDialogOpen(false),
    })
  }

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id)
    setContextMenu(null)
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      <div className="flex items-center justify-between px-3 mb-2">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Categorias</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="text-surface-400 hover:text-brand-600 transition-colors"
          title="Nueva categoria"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="px-3 py-2 text-sm text-surface-400">Cargando...</div>
      ) : rootCategories.length === 0 ? (
        <div className="px-3 py-4 text-sm text-surface-400 text-center">
          No hay categorias. Crea la primera.
        </div>
      ) : (
        rootCategories.map((cat) => (
          <div key={cat.id} className="relative group">
            <CategoryNode
              category={cat}
              children={getChildren(cat.id)}
              selectedId={selectedId}
              onSelect={onSelect}
              level={0}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setContextMenu({ id: cat.id, x: 0, y: 0 })
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))
      )}

      <CreateCategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createCategory.isPending}
      />

      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setContextMenu(null)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-surface-200 p-1.5">
            <button
              onClick={() => handleDelete(contextMenu.id)}
              className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Eliminar categoria
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
