import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { insforge } from '../lib/insforge'

interface AuthState {
  user: any | null
  loading: boolean
  initialized: boolean
  setAuth: (user: any | null) => void
  updateProfile: (profile: Record<string, unknown>) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        try {
          // Try SDK first — it will refresh session via httpOnly cookie if present
          const { data } = await insforge.auth.getCurrentUser()
          if (data?.user) {
            set({ user: data.user, loading: false, initialized: true })
            return
          }
        } catch {
          // SDK session expired or cookie missing — fall through to persisted user
        }

        // Fallback: use persisted user from localStorage (still shows UI while re-auth needed)
        const persistedUser = get().user
        set({
          user: persistedUser ?? null,
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
