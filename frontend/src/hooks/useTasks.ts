import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'
import type { Task, Priority } from '../types'
import type { CreateTaskFormData } from '../components/tasks/CreateTaskDialog'

type TaskCountRow = Pick<Task, 'category_id' | 'status_id'>

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
  const userId = useAuthStore((s) => s.user?.id)
  const queryKey = useMemo(() => ['tasks', categoryId, userId] as const, [categoryId, userId])

  useEffect(() => {
    if (!categoryId || !userId) return

    const channel = `tasks:${userId}:${categoryId}`

    const handleTaskCreated = (payload: { task?: Task }) => {
      if (!payload.task || payload.task.category_id !== categoryId) return

      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      queryClient.setQueryData<Task[]>(queryKey, (current = []) => {
        if (current.some((task) => task.id === payload.task!.id)) return current
        return [payload.task!, ...current]
      })
    }

    const handleTaskUpdated = (payload: { task?: Task }) => {
      if (!payload.task || payload.task.category_id !== categoryId) return
      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      queryClient.setQueryData<Task[]>(queryKey, (current = []) =>
        current.map((task) => task.id === payload.task!.id ? payload.task! : task),
      )
    }

    const handleTaskDeleted = (payload: { taskId?: string }) => {
      if (!payload.taskId) return
      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      queryClient.setQueryData<Task[]>(queryKey, (current = []) =>
        current.filter((task) => task.id !== payload.taskId),
      )
    }

    insforge.realtime.on('task_created', handleTaskCreated)
    insforge.realtime.on('task_updated', handleTaskUpdated)
    insforge.realtime.on('task_deleted', handleTaskDeleted)

    insforge.realtime
      .connect()
      .then(() => insforge.realtime.subscribe(channel))
      .catch(() => {
        // Realtime is additive; DB mutations still work if the socket is unavailable.
      })

    return () => {
      insforge.realtime.off('task_created', handleTaskCreated)
      insforge.realtime.off('task_updated', handleTaskUpdated)
      insforge.realtime.off('task_deleted', handleTaskDeleted)
      insforge.realtime.unsubscribe(channel)
    }
  }, [categoryId, queryClient, queryKey, userId])

  const publishTaskEvent = async (event: string, payload: Record<string, unknown>) => {
    if (!categoryId || !userId) return

    try {
      await insforge.realtime.publish(`tasks:${userId}:${categoryId}`, event, payload)
    } catch {
      // Realtime must not block the persisted DB mutation flow.
    }
  }

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = insforge
        .database.from('tasks')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })

      if (categoryId) {
        q = q.eq('category_id', categoryId)
      }

      const { data, error } = await q
      if (error) throw error
      return data as Task[]
    },
    enabled: !!categoryId && !!userId,
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
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      queryClient.setQueryData<Task[]>(queryKey, (current = []) => {
        if (current.some((item) => item.id === task.id)) return current
        return [task, ...current]
      })
      publishTaskEvent('task_created', { task })
    },
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput) => {
      const { data, error } = await insforge
        .database.from('tasks')
        .update(input)
        .eq('id', id)
        .eq('user_id', useAuthStore.getState().user?.id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      queryClient.setQueryData<Task[]>(queryKey, (current = []) =>
        current.map((task) => task.id === id ? { ...task, ...input } : task),
      )

      return { previousTasks }
    },
    onError: (_error, _input, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      queryClient.setQueryData<Task[]>(queryKey, (current = []) =>
        current.map((item) => item.id === task.id ? task : item),
      )
      publishTaskEvent('task_updated', { task })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge
        .database.from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', useAuthStore.getState().user?.id)

      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      queryClient.setQueryData<Task[]>(queryKey, (current = []) =>
        current.filter((task) => task.id !== id),
      )

      return { previousTasks }
    },
    onError: (_error, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pending-task-counts'] })
      publishTaskEvent('task_deleted', { taskId: id })
    },
  })

  return { ...query, createTask, updateTask, deleteTask }
}

export function toCreateTaskInput(categoryId: string, data: CreateTaskFormData): CreateTaskInput {
  return {
    title: data.title,
    description: data.description,
    priority: data.priority,
    status_id: data.status_id,
    due_date: data.due_date,
    category_id: categoryId,
  }
}

export function usePendingTaskCounts() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['pending-task-counts', userId],
    queryFn: async () => {
      const [tasksResult, statusesResult] = await Promise.all([
        insforge.database.from('tasks').select('category_id,status_id').eq('user_id', userId!),
        insforge.database.from('task_statuses').select('id,name').eq('user_id', userId!),
      ])

      if (tasksResult.error) throw tasksResult.error
      if (statusesResult.error) throw statusesResult.error

      const completedStatusIds = new Set(
        (statusesResult.data ?? [])
          .filter((status) => status.name?.trim().toLocaleLowerCase() === 'completado')
          .map((status) => status.id),
      )

      return ((tasksResult.data ?? []) as TaskCountRow[]).reduce<Record<string, number>>(
        (counts, task) => {
          if (completedStatusIds.has(task.status_id)) return counts
          counts[task.category_id] = (counts[task.category_id] ?? 0) + 1
          return counts
        },
        {},
      )
    },
    enabled: !!userId,
  })
}
