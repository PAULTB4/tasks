import { useState, useEffect } from 'react'
import type { Priority } from '../../types'
import { useTaskStatuses } from '../../hooks/useTaskStatuses'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'

interface CreateTaskDialogProps {
  categoryId: string
  defaultStatusId?: string
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    priority: Priority
    status_id: string
  }) => void
  isSubmitting: boolean
}

export function CreateTaskDialog({
  categoryId,
  defaultStatusId,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [statusId, setStatusId] = useState(defaultStatusId || '')

  const {
    data: statuses,
    isLoading: statusesLoading,
    isError: statusesError,
    seedGlobalStatuses,
  } = useTaskStatuses(categoryId)

  useEffect(() => {
    if (defaultStatusId) {
      setStatusId(defaultStatusId)
    } else if (statuses && statuses.length > 0 && !statusId) {
      setStatusId(statuses[0].id)
    }
  }, [defaultStatusId, statuses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !statusId) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status_id: statusId,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    if (defaultStatusId) {
      setStatusId(defaultStatusId)
    } else if (statuses && statuses.length > 0) {
      setStatusId(statuses[0].id)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Nueva tarea">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          >
            Título
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué tenés que hacer?"
            autoFocus
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          >
            Descripción (opcional)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles adicionales..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
            >
              Prioridad
            </label>
            <Select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </Select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
            >
              Estado
            </label>
            <Select
              id="status"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              disabled={statusesLoading || statusesError || (statuses && statuses.length === 0)}
            >
              {statusesLoading ? (
                <option value="">Cargando estados...</option>
              ) : statusesError ? (
                <option value="">Error al cargar estados</option>
              ) : statuses && statuses.length > 0 ? (
                statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option value="">Creando estados por defecto...</option>
              )}
            </Select>
            {statuses && statuses.length === 0 && !statusesLoading && seedGlobalStatuses.isPending && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                No hay estados disponibles. Se están creando automáticamente...
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !statusId}
          >
            {isSubmitting ? 'Creando...' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
