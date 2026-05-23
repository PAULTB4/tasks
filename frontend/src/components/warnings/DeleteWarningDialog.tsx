import { Dialog } from '../ui/Dialog'
import { WarningPanel } from './WarningPanel'

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
      <WarningPanel
        tone="red"
        heading={`¿Eliminar “${itemName}”?`}
        message={hasChildren
          ? 'También se moverá su contenido a Papelera.'
          : `Se moverá esta ${itemLabel} a Papelera.`}
        confirmLabel="Eliminar"
        pendingLabel="Eliminando..."
        isPending={isDeleting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  )
}
