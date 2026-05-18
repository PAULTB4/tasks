import { useState } from 'react'
import type { Task } from '../../types'
import { useTasks } from '../../hooks/useTasks'
import { CreateTaskDialog } from '../tasks/CreateTaskDialog'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import type { Priority } from '../../types'

const priorityLabels: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
}

interface ListViewProps {
  categoryId: string
}

export function ListView({ categoryId }: ListViewProps) {
  const { data: tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(categoryId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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
  }) => {
    createTask.mutate(
      {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status_id: data.status_id,
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
      <div className="flex items-center gap-4 px-4 py-3 border-b border-surface-100">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
          className="text-xs px-2 py-1.5 border border-surface-300 dark:border-surface-400 bg-white dark:bg-surface-100 text-surface-900 dark:text-surface-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">Todas las prioridades</option>
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
          <div className="flex items-center justify-center h-full text-surface-400">
            <p className="text-sm">No hay tareas en esta categoria</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {filteredTasks?.map((task) => {
              const priority = priorityLabels[task.priority]
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-200 transition-colors flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-surface-900 truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-surface-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${priority.color}`}>
                    {priority.label}
                  </span>
                  {task.due_date && (
                    <span className="text-[10px] text-surface-400 flex-shrink-0">
                      {new Date(task.due_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </button>
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
          onClose={() => setSelectedTask(null)}
          onUpdate={(data) => updateTask.mutate(data)}
          onDelete={(id) => deleteTask.mutate(id)}
          isUpdating={updateTask.isPending}
        />
      )}
    </div>
  )
}
