import type { Task, Priority } from '../../types'
import { Flag, MessageSquare } from 'lucide-react'

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

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = priorityConfig[task.priority]

  return (
    <button
      onClick={() => onClick(task)}
      className="w-full text-left bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
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

        {task.due_date && (
          <span className="text-xs text-surface-500 dark:text-surface-400 whitespace-nowrap flex-shrink-0">
            {new Date(task.due_date).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>
    </button>
  )
}
