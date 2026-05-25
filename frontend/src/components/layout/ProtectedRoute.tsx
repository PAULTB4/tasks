import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../hooks/useAuthStore'
import { useAdmin } from '../../hooks/useAdmin'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()
  const { isAdmin, isLoading: isAdminLoading } = useAdmin()

  if (!initialized || loading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Admin should go to /admin, not /dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
