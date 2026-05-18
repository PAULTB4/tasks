import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'
import type { TaskNote } from '../types'

export function useTaskNotes(taskId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['task_notes', taskId],
    queryFn: async () => {
      const { data, error } = await insforge
        .database.from('task_notes')
        .select('*')
        .eq('task_id', taskId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as TaskNote[]
    },
    enabled: !!taskId,
  })

  const createNote = useMutation({
    mutationFn: async (input: { task_id: string; content: string }) => {
      const userId = useAuthStore.getState().user?.id
      const { data, error } = await insforge
        .database.from('task_notes')
        .insert([{ ...input, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data as TaskNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_notes'] })
    },
  })

  const updateNote = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await insforge
        .database.from('task_notes')
        .update({ content })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TaskNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_notes'] })
    },
  })

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge
        .database.from('task_notes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_notes'] })
    },
  })

  return { ...query, createNote, updateNote, deleteNote }
}
