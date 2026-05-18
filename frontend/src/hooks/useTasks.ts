import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'
import type { Task, Priority } from '../types'

interface CreateTaskInput {
  title: string
  category_id: string
  status_id: string
  description?: string
  priority?: Priority
  due_date?: string | null
}

interface UpdateTaskInput {
  id: string
  title?: string
  description?: string | null
  priority?: Priority
  status_id?: string
  due_date?: string | null
}

export function useTasks(categoryId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['tasks', categoryId],
    queryFn: async () => {
      let q = insforge
        .database.from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (categoryId) {
        q = q.eq('category_id', categoryId)
      }

      const { data, error } = await q
      if (error) throw error
      return data as Task[]
    },
    enabled: !!categoryId,
  })

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const userId = useAuthStore.getState().user?.id
      const { data, error } = await insforge
        .database.from('tasks')
        .insert([{ ...input, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput) => {
      const { data, error } = await insforge
        .database.from('tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge
        .database.from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { ...query, createTask, updateTask, deleteTask }
}
