import { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { useFeedback } from '../../hooks/useFeedback'
import { Send, MessageSquareHeart } from 'lucide-react'

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
}

const TYPE_OPTIONS = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'suggestion', label: 'Sugerencia' },
  { value: 'bug', label: 'Reportar bug' },
]

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const [type, setType] = useState<'feedback' | 'suggestion' | 'bug'>('feedback')
  const [message, setMessage] = useState('')
  const { submit, isLoading } = useFeedback()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await submit({ type, message })
    if (!error) {
      setMessage('')
      setType('feedback')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 bg-brand-100 dark:bg-brand-900 rounded-full mb-3">
          <MessageSquareHeart size={28} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
          Comparte tu opinión
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Tu feedback nos ayuda a mejorar TaskForge
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="¿Qué te gustaría compartir?"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          options={TYPE_OPTIONS}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Tu mensaje</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Cuéntanos lo que piensas..."
            rows={4}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Tal vez después
          </Button>
          <Button type="submit" disabled={isLoading || !message.trim()}>
            <Send size={16} />
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}