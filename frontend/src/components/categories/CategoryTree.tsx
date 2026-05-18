import { useState } from 'react'
import { useCategories, useTrashCategories } from '../../hooks/useCategories'
import { useTasks } from '../../hooks/useTasks'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { CreateTaskDialog } from '../tasks/CreateTaskDialog'
import { TrashDialog } from './TrashDialog'
import type { Category } from '../../types'
import {
  ChevronDown,
  ChevronRight,
  Plus,
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
  onCreateTask,
  onDelete,
  level = 0,
}: {
  category: Category
  children: Category[]
  getChildren: (parentId: string) => Category[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateSub: (parentId: string) => void
  onCreateTask: (categoryId: string) => void
  onDelete: (id: string) => void
  level: number
}) {
  const isFolder = category.type === 'folder'
  const [expanded, setExpanded] = useState(isFolder)
  const indent = 8 + level * 14
  const connectorLeft = 18 + (level - 1) * 14

  return (
    <div className="relative min-w-0">
      {level > 0 && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700"
            style={{ left: `${connectorLeft}px` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-[18px] h-px w-3 bg-surface-200 dark:bg-surface-700"
            style={{ left: `${connectorLeft}px` }}
          />
        </>
      )}
      <div
        className={`group grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-1 rounded-xl text-sm transition-colors mx-1 sm:mx-2 min-w-0 ${
          selectedId === category.id
            ? 'bg-brand-100 dark:bg-brand-500/20'
            : 'hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
        style={{ paddingLeft: `${indent}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          disabled={!isFolder || children.length === 0}
          className={`inline-flex h-8 w-6 items-center justify-center rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 ${
            !isFolder || children.length === 0 ? 'opacity-0 cursor-default' : ''
          }`}
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
          className="min-w-0 flex items-center gap-2 py-2 rounded-lg text-left"
        >
          {isFolder ? (
            <Folder size={14} className="flex-shrink-0 text-amber-500" />
          ) : (
            <List size={14} className="flex-shrink-0 text-brand-500" />
          )}
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

        <div className="pr-1 sm:pr-2 flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isFolder) {
                onCreateSub(category.id)
              } else {
                onCreateTask(category.id)
              }
            }}
            className="inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-200 hover:text-brand-600 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-brand-300 transition-colors"
            aria-label={isFolder ? 'Nueva lista o carpeta' : 'Nueva tarea'}
            title={isFolder ? 'Nueva lista o carpeta' : 'Nueva tarea'}
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(category.id)
            }}
            className="inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors"
            aria-label="Eliminar"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.3} />
          </button>
        </div>
      </div>
      {expanded && isFolder && children.length > 0 && (
        <div className="mt-0.5 min-w-0">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              children={getChildren(child.id)}
              getChildren={getChildren}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSub={onCreateSub}
              onCreateTask={onCreateTask}
              onDelete={onDelete}
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
  const { data: deletedCategories } = useTrashCategories()
  const { createTask } = useTasks()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subcategoryParentId, setSubcategoryParentId] = useState<string | null>(
    null,
  )
  const [defaultCategoryType, setDefaultCategoryType] = useState<
    'folder' | 'list'
  >('folder')
  const [taskCategoryId, setTaskCategoryId] = useState<string | null>(null)
  const [trashOpen, setTrashOpen] = useState(false)

  const rootCategories = categories?.filter((c) => !c.parent_id) ?? []
  const trashRootCount = (deletedCategories ?? []).filter(
    (category) => category.deleted_root_id === category.id || !category.deleted_root_id,
  ).length
  const getChildren = (parentId: string) =>
    categories?.filter((c) => c.parent_id === parentId) ?? []

  const getDescendantIds = (categoryId: string): string[] => {
    const directChildren = getChildren(categoryId)

    return [
      categoryId,
      ...directChildren.flatMap((child) => getDescendantIds(child.id)),
    ]
  }

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
    setDefaultCategoryType('list')
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const category = categories?.find((item) => item.id === id)
    const ids = getDescendantIds(id)
    const deletedAs = category?.type === 'list'
      ? 'list'
      : ids.length > 1
        ? 'tree'
        : 'folder'

    deleteCategory.mutate({ ids, rootId: id, deletedAs })
  }

  const handleOpenRootDialog = (type: 'folder' | 'list' = 'folder') => {
    setSubcategoryParentId(null)
    setDefaultCategoryType(type)
    setDialogOpen(true)
  }

  const handleCreateTask = (categoryId: string) => {
    onSelect(categoryId)
    setTaskCategoryId(categoryId)
  }

  return (
    <div className="flex h-full min-w-0 flex-col py-2">
      <header className="flex items-center justify-between px-4 mb-2 mt-2">
        <h2 className="sr-only">
          Carpetas y listas
        </h2>
        <Button
          variant="ghost"
          size="md"
          onClick={() => handleOpenRootDialog('folder')}
          className="h-9 w-9 p-0 rounded-xl"
          aria-label="Nueva carpeta"
          title="Nueva carpeta"
        >
          <Plus size={20} />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-surface-500">Cargando...</div>
        ) : rootCategories.length === 0 ? (
          <div className="px-4 py-4 text-sm text-surface-500">
            <p className="text-center mb-3">No hay carpetas ni listas.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleOpenRootDialog('folder')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <Folder size={16} className="text-amber-500" />
                Crear carpeta
              </button>
              <button
                type="button"
                onClick={() => handleOpenRootDialog('list')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <List size={16} className="text-brand-500" />
                Crear lista
              </button>
            </div>
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
              onCreateTask={handleCreateTask}
              onDelete={handleDelete}
              level={0}
            />
          ))
        )}
      </div>

      <div className="mt-2 border-t border-surface-200 px-2 pt-2 dark:border-surface-800">
        <button
          type="button"
          onClick={() => setTrashOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
          title="Papelera"
        >
          <Trash2 size={16} className="text-surface-400" />
          <span>Papelera</span>
          {trashRootCount > 0 && (
            <span className="ml-auto rounded-full bg-surface-200 px-2 py-0.5 text-[10px] font-bold text-surface-500 dark:bg-surface-800">
              {trashRootCount}
            </span>
          )}
        </button>
      </div>

      <CreateCategoryDialog
        parentId={subcategoryParentId}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setSubcategoryParentId(null)
        }}
        onSubmit={handleCreate}
        isSubmitting={createCategory.isPending}
        defaultType={defaultCategoryType}
      />

      {taskCategoryId && (
        <CreateTaskDialog
          categoryId={taskCategoryId}
          open={!!taskCategoryId}
          onClose={() => setTaskCategoryId(null)}
          onSubmit={(data) => {
            createTask.mutate(
              { ...data, category_id: taskCategoryId },
              { onSuccess: () => setTaskCategoryId(null) },
            )
          }}
          isSubmitting={createTask.isPending}
        />
      )}

      <TrashDialog open={trashOpen} onClose={() => setTrashOpen(false)} />
    </div>
  )
}
