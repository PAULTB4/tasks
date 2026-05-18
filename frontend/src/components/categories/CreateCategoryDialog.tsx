import { useState } from 'react'
import { useAuthStore } from '../../hooks/useAuthStore'
import type { Category } from '../../types'

interface CreateCategoryDialogProps {
  parentId?: string | null
  open: boolean
  onClose: () => void
  onSubmit: (name: string, color: string, parentId?: string | null) => void
  isSubmitting: boolean
}

export function CreateCategoryDialog({ parentId, open, onClose, onSubmit, isSubmitting }: CreateCategoryDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), color, parentId)
    setName('')
    setColor('#6366f1')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-surface-200 p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">
          {parentId ? 'Nueva sub-categoria' : 'Nueva categoria'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Universidad"
              autoFocus
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Color</label>
            <div className="flex gap-2">
              {['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-surface-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-surface-600 hover:text-surface-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
