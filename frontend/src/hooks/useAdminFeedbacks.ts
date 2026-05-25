import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'

export interface Feedback {
  id: string
  user_id: string
  type: 'feedback' | 'suggestion' | 'bug'
  message: string
  read_at: string | null
  read_by: string | null
  created_at: string
}

export function useAdminFeedbacks() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  const feedbacks = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: async () => {
      const { data, error } = await insforge
        .database.from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Feedback[]
    },
  })

  const markAsRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await insforge
        .database.from('feedback')
        .update({ read_at: read ? new Date().toISOString() : null, read_by: read ? userId : null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
    },
  })

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge.database.from('feedback').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
    },
  })

  return { ...feedbacks, markAsRead, deleteFeedback }
}

export function useAdminStats() {
  const userId = useAuthStore((s) => s.user?.id)

  const stats = useQuery({
    queryKey: ['admin-stats', userId],
    queryFn: async () => {
      const [feedbackRes, userRes] = await Promise.all([
        insforge.database.from('feedback').select('*', { count: 'exact' }),
        insforge.database.from('user_profiles').select('*', { count: 'exact' }),
      ])

      const unreads = feedbackRes.data?.filter((f: Feedback) => !f.read_at).length ?? 0
      const byType = feedbackRes.data?.reduce((acc: Record<string, number>, f: Feedback) => {
        acc[f.type] = (acc[f.type] ?? 0) + 1
        return acc
      }, {})

      return {
        totalFeedbacks: feedbackRes.count ?? 0,
        totalUsers: userRes.count ?? 0,
        unreads,
        byType: byType ?? {},
      }
    },
  })

  return stats
}