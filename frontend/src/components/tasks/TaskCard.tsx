import type { Task, Priority } from '../../types'

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
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
      className="w-full text-left bg-white rounded-lg border border-surface-200 p-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-surface-900 line-clamp-2">{task.title}</h4>
        {task.due_date && (
          <span className="text-[10px] text-surface-400 whitespace-nowrap flex-shrink-0">
            {new Date(task.due_date).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.color}`}>
          {priority.label}
        </span>
      </div>
    </button>
  )
}
