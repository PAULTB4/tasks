import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'
import type { Category } from '../types'

export function useCategories() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  const query = useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => {
      const { data, error } = await insforge
        .database.from('categories')
        .select('*')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      return data as Category[]
    },
    enabled: !!userId,
  })

  const createCategory = useMutation({
    mutationFn: async (input: { name: string; color?: string; parent_id?: string | null; type?: 'folder' | 'list' }) => {
      const userId = useAuthStore.getState().user?.id
      const { data, error } = await insforge
        .database.from('categories')
        .insert([{ type: 'list', ...input, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name?: string; color?: string | null; parent_id?: string | null }) => {
      const { data, error } = await insforge
        .database.from('categories')
        .update(input)
        .eq('id', id)
        .eq('user_id', useAuthStore.getState().user?.id)
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const deleteCategory = useMutation({
    mutationFn: async (input: {
      ids: string[]
      rootId: string
      deletedAs: 'tree' | 'folder' | 'list'
    }) => {
      const ids = input.ids

      if (ids.length === 0) return

      const categoryDelete = await insforge
        .database.from('categories')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_root_id: input.rootId,
          deleted_as: input.deletedAs,
        })
        .in('id', ids)
        .eq('user_id', useAuthStore.getState().user?.id)

      if (categoryDelete.error) throw categoryDelete.error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['trash-categories'] })
    },
  })

  return { ...query, createCategory, updateCategory, deleteCategory }
}

export function useTrashCategories() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  const query = useQuery({
    queryKey: ['trash-categories', userId],
    queryFn: async () => {
      const { data, error } = await insforge
        .database.from('categories')
        .select('*')
        .eq('user_id', userId!)
        .order('deleted_at', { ascending: false })

      if (error) throw error
      return (data as Category[]).filter((category) => category.deleted_at)
    },
    enabled: !!userId,
  })

  const restoreCategory = useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return

      const { error } = await insforge
        .database.from('categories')
        .update({
          deleted_at: null,
          deleted_root_id: null,
          deleted_as: null,
        })
        .in('id', ids)
        .eq('user_id', useAuthStore.getState().user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['trash-categories'] })
    },
  })

  return { ...query, restoreCategory }
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category & { children: (Category & { children: any[] })[] }>()
  const roots: (Category & { children: any[] })[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of map.values()) {
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(cat)
    } else {
      roots.push(cat)
    }
  }

  return roots
}
