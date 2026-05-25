import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAdmin, isLoading } = useAdmin()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return <>{children}</>
}