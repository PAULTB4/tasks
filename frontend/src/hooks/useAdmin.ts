import { useQuery } from '@tanstack/react-query'
import { insforge } from '../lib/insforge'
import { useAuthStore } from './useAuthStore'

export function useAdmin() {
  const user = useAuthStore((s) => s.user)

  const { data: adminUser, isLoading } = useQuery({
    queryKey: ['admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await insforge
        .database.from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  return { 
    isAdmin: !!adminUser, 
    role: adminUser?.role ?? null, 
    isLoading, 
    user 
  }
}