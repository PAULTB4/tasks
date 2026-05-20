import { useState } from 'react'
import type { Task } from '../../types'
import { useTasks } from '../../hooks/useTasks'
import { CreateTaskDialog } from '../tasks/CreateTaskDialog'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import type { Priority } from '../../types'
import { Pencil, Trash2 } from 'lucide-react'
import { WarningDialog } from '../warnings/WarningDialog'

const priorityLabels: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
}

function getDueDateInfo(dueDate: string): { label: string; color: string } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Vencido', color: 'text-red-600 dark:text-red-400' }
  if (diffDays === 0) return { label: 'Hoy', color: 'text-red-600 dark:text-red-400' }
  if (diffDays === 1) return { label: '1d', color: 'text-orange-600 dark:text-orange-400' }
  if (diffDays <= 3) return { label: `${diffDays}d`, color: 'text-amber-600 dark:text-amber-400' }
  if (diffDays <= 7) return { label: `${diffDays}d`, color: 'text-blue-600 dark:text-blue-400' }
  return { label: `${diffDays}d`, color: 'text-surface-500 dark:text-surface-400' }
}

interface ListViewProps {
  categoryId: string
}

export function ListView({ categoryId }: ListViewProps) {
  const { data: tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(categoryId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  const filteredTasks = tasks?.filter((task) => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    return true
  })

  const handleCreateTask = (data: {
    title: string
    description: string
    priority: Priority
    status_id: string
    due_date: string | null
  }) => {
    createTask.mutate(
      {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status_id: data.status_id,
        due_date: data.due_date,
        category_id: categoryId,
      },
      { onSuccess: () => setCreateDialogOpen(false) }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 border-b border-surface-100 dark:border-surface-800">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
          className="text-xs px-2 py-1.5 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">Todas</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="ml-auto px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors"
        >
          Nueva tarea
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTasks?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-400 dark:text-surface-500">
            <p className="text-sm">No hay tareas en esta categoria</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {filteredTasks?.map((task) => {
              const priority = priorityLabels[task.priority]
              const dueInfo = task.due_date ? getDueDateInfo(task.due_date) : null
              return (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(false)
                      setSelectedTask(task)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{task.title}</h4>
                      {task.description && (
                        <p className="hidden sm:block text-xs text-surface-400 dark:text-surface-500 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${priority.color}`}>
                      {priority.label}
                    </span>
                    {dueInfo && (
                      <span className={`text-[10px] font-medium flex-shrink-0 ${dueInfo.color}`}>
                        {dueInfo.label}
                      </span>
                    )}
                  </button>
                  <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(true)
                        setSelectedTask(task)
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-brand-600 dark:hover:bg-surface-800 dark:hover:text-brand-300"
                      aria-label="Editar tarea"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      aria-label="Eliminar tarea"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreateTaskDialog
        categoryId={categoryId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={createTask.isPending}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          defaultEditing={editingTask}
          onClose={() => {
            setSelectedTask(null)
            setEditingTask(false)
          }}
          onUpdate={(data) => updateTask.mutate(data)}
          isUpdating={updateTask.isPending}
        />
      )}

      {taskToDelete && (
        <WarningDialog
          open={!!taskToDelete}
          title="Eliminar tarea"
          heading={`¿Eliminar “${taskToDelete.title}”?`}
          message="La tarea se eliminará de esta lista."
          confirmLabel="Eliminar"
          pendingLabel="Eliminando..."
          isPending={deleteTask.isPending}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => {
            deleteTask.mutate(taskToDelete.id, {
              onSuccess: () => setTaskToDelete(null),
            })
          }}
        />
      )}
    </div>
  )
}
