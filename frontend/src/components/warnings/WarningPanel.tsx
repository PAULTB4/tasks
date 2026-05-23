import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'

interface WarningPanelProps {
  tone: 'amber' | 'red'
  heading: string
  message: string
  confirmLabel: string
  pendingLabel?: string
  isPending: boolean
  confirmVariant?: 'default' | 'destructive'
  onClose: () => void
  onConfirm: () => void
}

const toneClassNames = {
  amber: {
    panel: 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  },
  red: {
    panel: 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10',
    icon: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  },
}

export function WarningPanel({
  tone,
  heading,
  message,
  confirmLabel,
  pendingLabel,
  isPending,
  confirmVariant = 'destructive',
  onClose,
  onConfirm,
}: WarningPanelProps) {
  const toneClasses = toneClassNames[tone]

  return (
    <div className="space-y-5">
      <div className={`flex gap-3 rounded-2xl border p-4 ${toneClasses.panel}`}>
        <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClasses.icon}`}>
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            {heading}
          </p>
          <p className="mt-1 text-sm leading-6 text-surface-500 dark:text-surface-400">
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-surface-200 pt-4 dark:border-surface-800">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? pendingLabel ?? confirmLabel : confirmLabel}
        </Button>
      </div>
    </div>
  )
}
