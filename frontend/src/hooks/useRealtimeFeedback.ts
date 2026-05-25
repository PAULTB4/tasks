import { useEffect } from 'react'
import { insforge } from '../lib/insforge'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeFeedback() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Subscribe function
    const subscribe = async () => {
      const { ok, error } = await insforge.realtime.subscribe('feedback')
      if (!ok) console.error('Subscribe failed:', error?.message)
    }

    // Ensure connected and subscribe
    if (insforge.realtime.isConnected) {
      subscribe()
    } else {
      insforge.realtime.connect().then(() => subscribe())
    }

    // Listen for feedback events
    const handleInsert = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }

    const handleDelete = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }

    insforge.realtime.on('INSERT_feedback', handleInsert)
    insforge.realtime.on('UPDATE_feedback', handleUpdate)
    insforge.realtime.on('DELETE_feedback', handleDelete)

    return () => {
      insforge.realtime.off('INSERT_feedback', handleInsert)
      insforge.realtime.off('UPDATE_feedback', handleUpdate)
      insforge.realtime.off('DELETE_feedback', handleDelete)
    }
  }, [queryClient])
}