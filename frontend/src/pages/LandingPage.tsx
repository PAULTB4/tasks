import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

export function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-brand-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-700">TaskForge</h1>
        {user ? (
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Ir al dashboard
          </Link>
        ) : (
          <Link
            to="/auth"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Iniciar sesion
          </Link>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold text-surface-900 mb-6 leading-tight">
            Tu segundo cerebro para tareas
          </h2>
          <p className="text-lg text-surface-600 mb-10 max-w-xl mx-auto">
            Organiza tus proyectos universitarios, personales y profesionales en un solo lugar.
            Kanban, notas y jerarquia sin limites.
          </p>
          <Link
            to={user ? '/dashboard' : '/auth'}
            className="inline-flex px-8 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-lg font-semibold shadow-lg shadow-brand-200"
          >
            {user ? 'Ir al dashboard' : 'Comenzar ahora'}
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-surface-400">
        TaskForge &middot; Construido con InsForge
      </footer>
    </div>
  )
}
