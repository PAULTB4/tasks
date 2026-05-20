import { useState } from 'react'
import { CategoryTree } from '../categories/CategoryTree'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../../hooks/useAuthStore'
import { LogOut, Settings } from 'lucide-react'
import { Button } from '../ui/Button'
import { SettingsDialog } from '../settings/SettingsDialog'
import { WarningDialog } from '../warnings/WarningDialog'

interface SidebarProps {
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const { user, signOut } = useAuthStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const avatarUrl = user?.profile?.avatar_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${user?.email}`
  const displayName = user?.profile?.name || user?.email

  return (
    <>
      <aside className="w-[min(20rem,86vw)] sm:w-80 lg:w-72 shrink-0 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <CategoryTree
            selectedId={selectedCategoryId}
            onSelect={onSelectCategory}
          />
        </div>

        <footer className="border-t border-surface-200 dark:border-surface-800 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="User avatar"
              className="w-8 h-8 rounded-full bg-surface-200 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                {displayName}
              </p>
              {user?.profile?.name && (
                <p className="text-xs text-surface-400 truncate">{user?.email}</p>
              )}
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} title="Ajustes">
              <Settings size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLogoutOpen(true)} title="Cerrar sesión">
              <LogOut size={18} />
            </Button>
          </div>
        </footer>
      </aside>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <WarningDialog
        open={logoutOpen}
        title="Cerrar sesión"
        heading="¿Cerrar tu sesión?"
        message="Vas a salir de tu cuenta en este dispositivo."
        confirmLabel="Cerrar sesión"
        pendingLabel="Cerrando..."
        confirmVariant="default"
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false)
          signOut()
        }}
      />
    </>
  )
}
