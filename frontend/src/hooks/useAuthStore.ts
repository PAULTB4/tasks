import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { insforge } from '../lib/insforge'

interface AuthUser {
  id: string
  email?: string
  profile?: Record<string, unknown>
  [key: string]: unknown
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  setAuth: (user: AuthUser | null) => void
  updateProfile: (profile: Record<string, unknown>) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      initialized: false,
      setAuth: (user) => set({ user, loading: false, initialized: true }),
      updateProfile: (profile) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                profile: {
                  ...(state.user.profile ?? {}),
                  ...profile,
                },
              }
            : null,
        })),
      signOut: async () => {
        await insforge.auth.signOut()
        set({ user: null, loading: false, initialized: true })
      },
      initialize: async () => {
        set({ loading: true })

        try {
          // Try SDK first — it will refresh session via httpOnly cookie if present
          const { data } = await insforge.auth.getCurrentUser()
          if (data?.user) {
            set({ user: data.user, loading: false, initialized: true })
            return
          }
        } catch {
          // SDK session expired or cookie missing — do not trust persisted UI state.
        }

        set({
          user: null,
          loading: false,
          initialized: true,
        })
      },
    }),
    {
      name: 'taskforge-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
