import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import type { Category } from '../../types'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  FolderPlus,
  Folder,
  List,
  Trash2,
} from 'lucide-react'
import { Button } from '../ui/Button'

function CategoryNode({
  category,
  children,
  getChildren,
  selectedId,
  onSelect,
  onCreateSub,
  onContextMenu,
  level = 0,
}: {
  category: Category
  children: Category[]
  getChildren: (parentId: string) => Category[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateSub: (parentId: string) => void
  onContextMenu: (
    e: React.MouseEvent,
    category: Category,
  ) => void
  level: number
}) {
  const isFolder = category.type === 'folder'
  const [expanded, setExpanded] = useState(isFolder)

  return (
    <div className="group relative">
      <div
        className={`flex items-center gap-1 rounded-lg text-sm transition-colors mx-2 ${
          selectedId === category.id
            ? 'bg-brand-100 dark:bg-brand-500/20'
            : 'hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          disabled={!isFolder || children.length === 0}
          className={`p-1.5 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 ${
            !isFolder || children.length === 0 ? 'opacity-0 cursor-default' : ''
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {isFolder && children.length > 0 &&
            (expanded ? (
              <ChevronDown size={16} className="text-surface-500" />
            ) : (
              <ChevronRight size={16} className="text-surface-500" />
            ))}
        </button>

        <button
          onClick={() => onSelect(category.id)}
          onContextMenu={(e) => onContextMenu(e, category)}
          className="flex-1 flex items-center gap-2.5 py-1.5 rounded-lg"
        >
          {isFolder ? (
            <Folder size={14} className="flex-shrink-0 text-amber-500" />
          ) : (
            <List size={14} className="flex-shrink-0 text-brand-500" />
          )}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
          <span
            className={`truncate ${
              selectedId === category.id
                ? 'font-semibold text-brand-800 dark:text-brand-300'
                : 'text-surface-700 dark:text-surface-300 font-medium'
            }`}
          >
            {category.name}
          </span>
        </button>

        <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onContextMenu(e, category)
            }}
            className="h-7 w-7 p-0"
            aria-label="Más opciones"
          >
            <MoreHorizontal size={16} />
          </Button>
          {isFolder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCreateSub(category.id)
              }}
              className="h-7 w-7 p-0"
              aria-label="Nueva subcategoría"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
      {expanded && isFolder && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              children={getChildren(child.id)}
              getChildren={getChildren}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSub={onCreateSub}
              onContextMenu={onContextMenu}
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
  const {
    data: categories,
    isLoading,
    createCategory,
    deleteCategory,
  } = useCategories()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subcategoryParentId, setSubcategoryParentId] = useState<string | null>(
    null,
  )
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    category: Category
  } | null>(null)

  const rootCategories = categories?.filter((c) => !c.parent_id) ?? []
  const getChildren = (parentId: string) =>
    categories?.filter((c) => c.parent_id === parentId) ?? []

  const handleCreate = (
    name: string,
    color: string,
    parentId: string | null,
    type: 'folder' | 'list',
  ) => {
    createCategory.mutate(
      { name, color, parent_id: parentId, type },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setSubcategoryParentId(null)
        },
      },
    )
  }

  const handleCreateSub = (parentId: string) => {
    setSubcategoryParentId(parentId)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id)
    setContextMenu(null)
  }

  const handleOpenRootDialog = () => {
    setSubcategoryParentId(null)
    setDialogOpen(true)
  }

  const handleContextMenu = (
    e: React.MouseEvent,
    category: Category,
  ) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, category })
  }

  return (
    <div
      className="flex-1 overflow-y-auto py-2"
      onClick={() => setContextMenu(null)}
    >
      <header className="flex items-center justify-between px-4 mb-2 mt-2">
        <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Categorías
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenRootDialog}
          className="h-7 w-7 p-0"
          aria-label="Nueva categoría"
        >
          <Plus size={16} />
        </Button>
      </header>

      {isLoading ? (
        <div className="px-4 py-2 text-sm text-surface-500">Cargando...</div>
      ) : rootCategories.length === 0 ? (
        <div className="px-4 py-4 text-sm text-center text-surface-500">
          No hay categorías.
          <Button
            variant="link"
            onClick={handleOpenRootDialog}
            className="text-sm"
          >
            Creá la primera.
          </Button>
        </div>
      ) : (
        rootCategories.map((cat) => (
          <CategoryNode
            key={cat.id}
            category={cat}
            children={getChildren(cat.id)}
            getChildren={getChildren}
            selectedId={selectedId}
            onSelect={onSelect}
            onCreateSub={handleCreateSub}
            onContextMenu={handleContextMenu}
            level={0}
          />
        ))
      )}

      <CreateCategoryDialog
        parentId={subcategoryParentId}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setSubcategoryParentId(null)
        }}
        onSubmit={handleCreate}
        isSubmitting={createCategory.isPending}
      />

      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-white dark:bg-surface-800 rounded-lg shadow-2xl border border-surface-200 dark:border-surface-700 p-2 min-w-[200px]"
        >
          {contextMenu.category.type === 'folder' && (
            <button
              onClick={() => handleCreateSub(contextMenu.category.id)}
              className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md"
            >
              <FolderPlus size={16} />
              <span>Nueva subcategoría</span>
            </button>
          )}
          <button
            onClick={() => handleDelete(contextMenu.category.id)}
            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md"
          >
            <Trash2 size={16} />
            <span>Eliminar categoría</span>
          </button>
        </div>
      )}
    </div>
  )
}
