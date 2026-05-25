import { useState } from 'react'
import { insforge } from '../lib/insforge'
import { useAuthStore } from '../hooks/useAuthStore'

interface FeedbackPayload {
  type: 'feedback' | 'suggestion' | 'bug'
  message: string
}

export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore((s) => s.user)

  const submit = async ({ type, message }: FeedbackPayload) => {
    if (!user?.id) return { error: 'Not authenticated' }
    if (!message.trim()) return { error: 'Message is required' }

    setIsLoading(true)
    try {
      const { error } = await insforge.database
        .from('feedback')
        .insert({ user_id: user.id, type, message: message.trim() })
        .select()
        .single()

      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  return { submit, isLoading }
}