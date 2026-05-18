import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskStatus } from '../../types'
import { TaskCard } from '../tasks/TaskCard'
import { Plus } from 'lucide-react'

function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task
  onClick: (task: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  )
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onCreateTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { type: 'column', status },
  })

  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col rounded-xl transition-colors ${
        isOver
          ? 'bg-brand-50/50 dark:bg-brand-900/20'
          : 'bg-surface-100 dark:bg-surface-800'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">
            {status.name}
          </h3>
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onCreateTask}
          className="text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          title="Agregar tarea"
        >
          <Plus size={20} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[120px]"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24 text-sm text-surface-500 dark:text-surface-400">
            Arrastrá una tarea acá
          </div>
        )}
        {isOver && (
          <div className="flex items-center justify-center h-24 rounded-lg bg-brand-50 dark:bg-brand-900/20 border-2 border-dashed border-brand-300 dark:border-brand-700">
            <p className="text-sm font-medium text-brand-600 dark:text-brand-300">
              Soltá para mover
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
