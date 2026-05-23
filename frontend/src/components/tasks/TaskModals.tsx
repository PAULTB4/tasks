import type { Task } from '../../types'
import { TaskDetailModal } from './TaskDetailModal'
import { WarningDialog } from '../warnings/WarningDialog'
import type { useTaskModalState } from '../../hooks/useTaskModalState'

interface TaskModalsProps {
  state: ReturnType<typeof useTaskModalState>
  isUpdating: boolean
  isDeleting: boolean
  onUpdateTask: (data: Parameters<React.ComponentProps<typeof TaskDetailModal>['onUpdate']>[0]) => void
  onDeleteTask: (task: Task, onSuccess: () => void) => void
}

export function TaskModals({
  state,
  isUpdating,
  isDeleting,
  onUpdateTask,
  onDeleteTask,
}: TaskModalsProps) {
  const { selectedTask, editingTask, taskToDelete } = state

  return (
    <>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          defaultEditing={editingTask}
          onClose={state.closeSelectedTask}
          onUpdate={onUpdateTask}
          isUpdating={isUpdating}
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
          isPending={isDeleting}
          onClose={state.closeDelete}
          onConfirm={() => onDeleteTask(taskToDelete, state.closeDelete)}
        />
      )}
    </>
  )
}
