import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import type { Category } from '../types'

export function useCategories() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await insforge
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
  })

  const createCategory = useMutation({
    mutationFn: async (input: { name: string; color?: string; parent_id?: string | null }) => {
      const { data, error } = await insforge
        .from('categories')
        .insert([input])
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
        .from('categories')
        .update(input)
        .eq('id', id)
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
    mutationFn: async (id: string) => {
      const { error } = await insforge
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { ...query, createCategory, updateCategory, deleteCategory }
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
