import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteWarningDialogProps {
  open: boolean
  title: string
  itemName: string
  itemType: 'folder' | 'list'
  affectedCount?: number
  isDeleting?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteWarningDialog({
  open,
  title,
  itemName,
  itemType,
  affectedCount = 1,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteWarningDialogProps) {
  const itemLabel = itemType === 'folder' ? 'carpeta' : 'lista'
  const hasChildren = affectedCount > 1

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              ¿Eliminar “{itemName}”?
            </p>
            <p className="mt-1 text-sm leading-6 text-surface-500 dark:text-surface-400">
              {hasChildren
                ? `También se moverá su contenido a Papelera.`
                : `Se moverá esta ${itemLabel} a Papelera.`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-200 pt-4 dark:border-surface-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
