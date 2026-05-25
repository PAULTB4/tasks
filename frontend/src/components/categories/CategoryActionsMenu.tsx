import { useState, useEffect, useRef, useCallback } from 'react'
import { MoreVertical, Pencil, Trash2, Plus } from 'lucide-react'

interface CategoryActionsMenuProps {
  isFolder: boolean
  onAdd: () => void
  onEdit: () => void
  onDelete: () => void
}

export function CategoryActionsMenu({ isFolder, onAdd, onEdit, onDelete }: CategoryActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const calculatePosition = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow < 200) {
      setPosition('top')
    } else {
      setPosition('bottom')
    }
  }, [])

  useEffect(() => {
    if (open) {
      calculatePosition()
    }
  }, [open, calculatePosition])

  const handleAction = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200 transition-colors"
        aria-label="Opciones"
        title="Opciones"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-1 w-48 rounded-xl border border-surface-200 bg-white p-1 shadow-lg dark:border-surface-700 dark:bg-surface-900 ${
            position === 'bottom' ? 'top-full' : 'bottom-full mb-1'
          }`}
        >
          <button
            type="button"
            onClick={() => handleAction(onAdd)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
          >
            <Plus size={15} className="text-surface-400" />
            {isFolder ? 'Crear lista o carpeta' : 'Crear tarea'}
          </button>
          <button
            type="button"
            onClick={() => handleAction(onEdit)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
          >
            <Pencil size={15} className="text-surface-400" />
            Renombrar
          </button>
          <div className="my-1 h-px bg-surface-100 dark:bg-surface-800" />
          <button
            type="button"
            onClick={() => handleAction(onDelete)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 size={15} className="text-red-500" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
