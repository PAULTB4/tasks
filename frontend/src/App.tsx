import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuthStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardLayout } from './pages/DashboardLayout'
import { CategoryView } from './pages/CategoryView'

function EmptyDashboard() {
  return (
    <div className="flex items-center justify-center h-full text-surface-400">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
        <p className="text-lg font-medium text-surface-500">Bienvenido a TaskForge</p>
        <p className="text-sm text-surface-400 mt-1">Crea una categoria en el panel izquierdo para empezar</p>
      </div>
    </div>
  )
}

function App() {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmptyDashboard />} />
        <Route path="category/:categoryId" element={<CategoryView />} />
      </Route>
    </Routes>
  )
}

export default App
