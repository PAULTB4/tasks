import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'taskforge-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  initialize: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme: (theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
  initialize: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const theme = stored ?? 'system'
    applyTheme(theme)
    set({ theme })

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (get().theme === 'system') {
        applyTheme('system')
      }
    })
  },
}))
