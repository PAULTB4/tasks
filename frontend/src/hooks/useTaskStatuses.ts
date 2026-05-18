import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'
import type { TaskStatus } from '../types'

let globalSeedPending = false

export function useTaskStatuses(categoryId?: string | null) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  const query = useQuery({
    queryKey: ['task_statuses', categoryId ?? 'global'],
    queryFn: async () => {
      const { data: globalData, error: globalError } = await insforge
        .database.from('task_statuses')
        .select('*')
        .is('category_id', null)
        .order('position')

      if (globalError) throw globalError

      if (!categoryId) {
        return (globalData ?? []) as TaskStatus[]
      }

      const { data: categoryData, error: categoryError } = await insforge
        .database.from('task_statuses')
        .select('*')
        .eq('category_id', categoryId)
        .order('position')

      if (categoryError) throw categoryError

      if (categoryData && categoryData.length > 0) {
        return categoryData as TaskStatus[]
      }

      return (globalData ?? []) as TaskStatus[]
    },
    enabled: !!userId,
  })

  const seedGlobalStatuses = useMutation({
    mutationFn: async () => {
      const defaults = [
        { user_id: userId, name: 'Pendiente', position: 0, color: '#6b7280' },
        { user_id: userId, name: 'En progreso', position: 1, color: '#6366f1' },
        { user_id: userId, name: 'Completado', position: 2, color: '#22c55e' },
      ]

      const { data, error } = await insforge
        .database.from('task_statuses')
        .insert(defaults)
        .select()

      if (error) throw error
      return data as TaskStatus[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_statuses'] })
    },
  })

  useEffect(() => {
    if (
      userId &&
      !query.isLoading &&
      !query.isFetching &&
      !query.isError &&
      query.data &&
      query.data.length === 0 &&
      !globalSeedPending
    ) {
      globalSeedPending = true
      seedGlobalStatuses.mutate(undefined, {
        onSettled: () => { globalSeedPending = false },
      })
    }
  }, [userId, query.isLoading, query.isFetching, query.isError, query.data])

  return { ...query, seedGlobalStatuses }
}
