import { useEffect, useState } from 'react'
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
}

const DEFAULT_CATEGORY_COLOR = '#6366f1'

export function CreateCategoryDialog({
  parentId,
  open,
  onClose,
  onSubmit,
  isSubmitting,
  defaultType = 'list',
}: CreateCategoryDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'folder' | 'list'>(defaultType)

  useEffect(() => {
    if (open) {
      setType(defaultType)
    }
  }, [open, defaultType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), DEFAULT_CATEGORY_COLOR, parentId ?? null, type)
    setName('')
    setType(defaultType)
  }

  const handleClose = () => {
    setName('')
    setType(defaultType)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={parentId ? 'Nueva lista o carpeta' : 'Nueva carpeta o lista'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="category-name"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          >
            Nombre
          </label>
          <Input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Universidad"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Tipo
          </label>
          <div className="flex items-center bg-surface-200 dark:bg-surface-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setType('folder')}
              className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'folder'
                  ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-800 dark:hover:text-white'
              }`}
            >
              <Folder size={16} />
              <span>Carpeta</span>
            </button>
            <button
              type="button"
              onClick={() => setType('list')}
              className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'list'
                  ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-800 dark:hover:text-white'
              }`}
            >
              <List size={16} />
              <span>Lista</span>
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-1.5">
            {type === 'folder'
              ? 'Las carpetas contienen subcarpetas o listas. No pueden tener tareas.'
              : 'Las listas contienen tareas. No pueden tener subcarpetas.'}
          </p>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
