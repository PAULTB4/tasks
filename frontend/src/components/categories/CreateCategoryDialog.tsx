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
}

const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function CreateCategoryDialog({
  parentId,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[0])
  const [type, setType] = useState<'folder' | 'list'>('list')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), color, parentId ?? null, type)
    setName('')
    setColor(colors[0])
    setType('list')
  }

  const handleClose = () => {
    setName('')
    setColor(colors[0])
    setType('list')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={parentId ? 'Nueva sub-categoría' : 'Nueva categoría'}
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
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Color
          </label>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform transform ${
                  color === c
                    ? 'border-surface-900 dark:border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
