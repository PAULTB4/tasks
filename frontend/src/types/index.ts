export interface Category {
  id: string
  user_id: string
  name: string
  color: string | null
  parent_id: string | null
  type: 'folder' | 'list'
  created_at: string
}

export interface TaskStatus {
  id: string
  user_id: string
  category_id: string | null
  name: string
  position: number
  color: string
  created_at: string
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  user_id: string
  category_id: string
  status_id: string
  title: string
  description: string | null
  priority: Priority
  due_date: string | null
  notes_count?: number
  created_at: string
  updated_at: string
}

export interface TaskNote {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export type CategoryTree = Category & {
  children: CategoryTree[]
}
