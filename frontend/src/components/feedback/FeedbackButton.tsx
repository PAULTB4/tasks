import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { FeedbackDialog } from './FeedbackDialog'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-colors"
        aria-label="Send feedback"
      >
        <MessageSquare size={20} />
      </button>
      <FeedbackDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}