import { create } from 'zustand'
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

export const useAuthStore = create<AuthState>((set) => ({
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
    set({ user: null })
  },
  initialize: async () => {
    try {
      const { data } = await insforge.auth.getCurrentUser()
      set({
        user: data?.user ?? null,
        loading: false,
        initialized: true,
      })
    } catch {
      set({ user: null, loading: false, initialized: true })
    }
  },
}))
