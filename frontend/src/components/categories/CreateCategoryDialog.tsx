import { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Folder, List } from 'lucide-react'

interface CreateCategoryDialogProps {
  parentId?: string | null
  open: boolean
  onClose: () => void
  onSubmit: (name: string, color: string, parentId: string | null, type: 'folder' | 'list') => void
  isSubmitting: boolean
  defaultType?: 'folder' | 'list'
  /** When provided, dialog switches to edit/rename mode */
  editCategory?: { id: string; name: string; type: 'folder' | 'list' } | null
  onEditSubmit?: (id: string, name: string) => void
}

const DEFAULT_CATEGORY_COLOR = '#6366f1'
const CATEGORY_TYPE_OPTIONS = [
  {
    type: 'folder' as const,
    label: 'Carpeta',
    helper: 'Para organizar',
    icon: Folder,
  },
  {
    type: 'list' as const,
    label: 'Lista',
    helper: 'Para tareas',
    icon: List,
  },
]

export function CreateCategoryDialog({
  open,
  ...props
}: CreateCategoryDialogProps) {
  if (!open) return null

  return <CreateCategoryDialogContent key={`${props.editCategory?.id ?? 'create'}:${props.parentId ?? 'root'}:${props.defaultType ?? 'list'}`} open={open} {...props} />
}

function CreateCategoryDialogContent({
  parentId,
  open,
  onClose,
  onSubmit,
  isSubmitting,
  defaultType = 'list',
  editCategory,
  onEditSubmit,
}: CreateCategoryDialogProps) {
  const isEditMode = !!editCategory
  const [name, setName] = useState(editCategory?.name ?? '')
  const [type, setType] = useState<'folder' | 'list' | null>(null)
  const selectedType = type ?? defaultType
  const selectedTypeLabel = isEditMode
    ? (editCategory!.type === 'folder' ? 'carpeta' : 'lista')
    : (selectedType === 'folder' ? 'carpeta' : 'lista')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (isEditMode && onEditSubmit) {
      onEditSubmit(editCategory!.id, name.trim())
    } else {
      onSubmit(name.trim(), DEFAULT_CATEGORY_COLOR, parentId ?? null, selectedType)
    }
  }

  const handleClose = () => {
    setName('')
    setType(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={
        isEditMode
          ? `Renombrar ${selectedTypeLabel}`
          : (parentId ? 'Crear dentro de esta carpeta' : 'Crear nuevo espacio')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditMode && (
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORY_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = selectedType === option.type

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setType(option.type)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-sm ring-2 ring-brand-500/10 dark:border-brand-400 dark:bg-brand-500/10'
                      : 'border-surface-200 bg-white hover:border-surface-300 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:hover:border-surface-600 dark:hover:bg-surface-800'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      option.type === 'folder'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'
                        : 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                    }`}>
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-surface-900 dark:text-surface-100">
                        {option.label}
                      </span>
                      <span className="block text-xs text-surface-400">
                        {option.helper}
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div>
          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-semibold text-surface-800 dark:text-surface-200"
          >
            Nombre de la {selectedTypeLabel}
          </label>
          <Input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedType === 'folder' ? 'Ej: Universidad' : 'Ej: Pendientes'}
            autoFocus
          />
        </div>

        <div className="flex gap-3 justify-end border-t border-surface-200 pt-4 dark:border-surface-800">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting
              ? (isEditMode ? 'Guardando...' : 'Creando...')
              : (isEditMode ? `Guardar` : `Crear ${selectedTypeLabel}`)}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
