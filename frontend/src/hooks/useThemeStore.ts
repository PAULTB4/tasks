import { create } from 'zustand'

type Theme = 'light'

function applyTheme() {
  document.documentElement.classList.remove('dark')
}

interface ThemeState {
  theme: Theme
  initialize: () => void
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: 'light',
  initialize: () => {
    applyTheme()
  },
}))
