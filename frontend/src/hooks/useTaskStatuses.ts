import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import type { TaskStatus } from '../types'

export function useTaskStatuses(categoryId?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['task_statuses', categoryId ?? 'global'],
    queryFn: async () => {
      const query = insforge
        .from('task_statuses')
        .select('*')
        .order('position')

      if (categoryId) {
        query.eq('category_id', categoryId)
      } else {
        query.is('category_id', null)
      }

      const { data, error } = await query
      if (error) throw error
      return data as TaskStatus[]
    },
  })

  const seedGlobalStatuses = useMutation({
    mutationFn: async (userId: string) => {
      const defaults = [
        { user_id: userId, name: 'Pendiente', position: 0, color: '#6b7280' },
        { user_id: userId, name: 'En progreso', position: 1, color: '#6366f1' },
        { user_id: userId, name: 'Completado', position: 2, color: '#22c55e' },
      ]

      const { data, error } = await insforge
        .from('task_statuses')
        .insert(defaults)
        .select()

      if (error) throw error
      return data as TaskStatus[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_statuses'] })
    },
  })

  return { ...query, seedGlobalStatuses }
}
