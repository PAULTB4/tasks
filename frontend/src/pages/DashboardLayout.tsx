import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { categoryId } = useParams()

  return (
    <div className="h-screen flex bg-surface-50 dark:bg-surface-100">
      <Sidebar
        selectedCategoryId={categoryId || null}
        onSelectCategory={(id) => navigate(`/dashboard/category/${id}`)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
