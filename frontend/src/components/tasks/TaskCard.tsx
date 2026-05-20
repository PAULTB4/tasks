import type { Task, Priority } from '../../types'
import { Flag, MessageSquare, Pencil, Trash2, Clock } from 'lucide-react'

const priorityConfig: Record<
  Priority,
  { label: string; color: string; darkColor: string; iconColor: string }
> = {
  low: {
    label: 'Baja',
    color: 'bg-green-100 text-green-800',
    darkColor: 'dark:bg-green-900/40 dark:text-green-300',
    iconColor: 'text-green-500',
  },
  medium: {
    label: 'Media',
    color: 'bg-yellow-100 text-yellow-800',
    darkColor: 'dark:bg-yellow-900/40 dark:text-yellow-300',
    iconColor: 'text-yellow-500',
  },
  high: {
    label: 'Alta',
    color: 'bg-orange-100 text-orange-800',
    darkColor: 'dark:bg-orange-900/40 dark:text-orange-300',
    iconColor: 'text-orange-500',
  },
  urgent: {
    label: 'Urgente',
    color: 'bg-red-100 text-red-800',
    darkColor: 'dark:bg-red-900/40 dark:text-red-300',
    iconColor: 'text-red-500',
  },
}

function getDueDateInfo(dueDate: string): { label: string; color: string; darkColor: string } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: 'Vencido', color: 'text-red-600', darkColor: 'dark:text-red-400' }
  }
  if (diffDays === 0) {
    return { label: 'Hoy', color: 'text-red-600', darkColor: 'dark:text-red-400' }
  }
  if (diffDays === 1) {
    return { label: '1d', color: 'text-orange-600', darkColor: 'dark:text-orange-400' }
  }
  if (diffDays <= 3) {
    return { label: `${diffDays}d`, color: 'text-amber-600', darkColor: 'dark:text-amber-400' }
  }
  if (diffDays <= 7) {
    return { label: `${diffDays}d`, color: 'text-blue-600', darkColor: 'dark:text-blue-400' }
  }
  return { label: `${diffDays}d`, color: 'text-surface-500', darkColor: 'dark:text-surface-400' }
}

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority]
  const dueInfo = task.due_date ? getDueDateInfo(task.due_date) : null

  return (
    <div className="group relative">
      <button
        onClick={() => onClick(task)}
        className="w-full text-left bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 pr-16 shadow-sm hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <h4 className="font-semibold text-surface-800 dark:text-surface-100 line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {task.description && (
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${priority.color} ${priority.darkColor}`}
            >
              <Flag size={14} className={priority.iconColor} />
              <span>{priority.label}</span>
            </div>
            {(task.notes_count ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                <MessageSquare size={14} />
                <span>{task.notes_count}</span>
              </div>
            )}
          </div>

          {dueInfo && (
            <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap flex-shrink-0 ${dueInfo.color} ${dueInfo.darkColor}`}>
              <Clock size={12} />
              <span>{dueInfo.label}</span>
            </span>
          )}
        </div>
      </button>

      <div className={`absolute right-2 top-2 flex gap-1 transition-opacity ${onEdit || onDelete ? 'sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 opacity-100' : ''}`}>
        {onEdit && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(task)
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-brand-600 dark:hover:bg-surface-800 dark:hover:text-brand-300"
            aria-label="Editar tarea"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(task)
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Eliminar tarea"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
