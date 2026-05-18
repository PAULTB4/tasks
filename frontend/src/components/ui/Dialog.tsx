import { X } from 'lucide-react'
import { useEffect } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-surface-100 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-400 p-6 w-full max-w-lg mx-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-200"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
