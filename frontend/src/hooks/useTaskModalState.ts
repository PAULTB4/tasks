import { useState } from 'react'
import type { Task } from '../types'

export function useTaskModalState() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  return {
    selectedTask,
    editingTask,
    taskToDelete,
    openTask: (task: Task) => {
      setEditingTask(false)
      setSelectedTask(task)
    },
    editTask: (task: Task) => {
      setEditingTask(true)
      setSelectedTask(task)
    },
    requestDelete: setTaskToDelete,
    closeSelectedTask: () => {
      setSelectedTask(null)
      setEditingTask(false)
    },
    closeDelete: () => setTaskToDelete(null),
  }
}
