import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { Task, Priority } from '../../types'
import { useTasks } from '../../hooks/useTasks'
import { useTaskStatuses } from '../../hooks/useTaskStatuses'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from '../tasks/TaskCard'
import { CreateTaskDialog } from '../tasks/CreateTaskDialog'
import { TaskDetailModal } from '../tasks/TaskDetailModal'

interface KanbanBoardProps {
  categoryId: string
}

export function KanbanBoard({ categoryId }: KanbanBoardProps) {
  const { data: tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(categoryId)
  const { data: statuses, isLoading: statusesLoading } = useTaskStatuses(categoryId)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [defaultStatusId, setDefaultStatusId] = useState<string | undefined>()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    const task = tasks?.find((t) => t.id === taskId)
    if (!task) return

    if (task.status_id !== overId && statuses?.some((s) => s.id === overId)) {
      updateTask.mutate({ id: taskId, status_id: overId })
    }
  }

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
      {
        onSuccess: () => setCreateDialogOpen(false),
      }
    )
  }

  if (statusesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  const getTasksByStatus = (statusId: string) =>
    tasks?.filter((t) => t.status_id === statusId) ?? []

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex gap-4 overflow-x-auto p-6">
          {statuses?.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={getTasksByStatus(status.id)}
              onTaskClick={setSelectedTask}
              onCreateTask={() => {
                setDefaultStatusId(status.id)
                setCreateDialogOpen(true)
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        categoryId={categoryId}
        defaultStatusId={defaultStatusId}
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
    </>
  )
}
