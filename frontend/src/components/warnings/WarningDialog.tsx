import { Dialog } from '../ui/Dialog'
import { WarningPanel } from './WarningPanel'

interface WarningDialogProps {
  open: boolean
  title: string
  heading: string
  message: string
  confirmLabel: string
  pendingLabel?: string
  isPending?: boolean
  confirmVariant?: 'default' | 'destructive'
  onClose: () => void
  onConfirm: () => void
}

export function WarningDialog({
  open,
  title,
  heading,
  message,
  confirmLabel,
  pendingLabel,
  isPending = false,
  confirmVariant = 'destructive',
  onClose,
  onConfirm,
}: WarningDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <WarningPanel
        tone="amber"
        heading={heading}
        message={message}
        confirmLabel={confirmLabel}
        pendingLabel={pendingLabel}
        isPending={isPending}
        confirmVariant={confirmVariant}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  )
}
