import { create } from 'zustand'
import { insforge } from '../lib/insforge'

interface AuthState {
  session: any | null
  user: any | null
  loading: boolean
  initialized: boolean
  setSession: (session: any | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, loading: false, initialized: true }),
  signOut: async () => {
    await insforge.auth.signOut()
    set({ session: null, user: null })
  },
  initialize: async () => {
    try {
      const { data } = await insforge.auth.getSession()
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        initialized: true,
      })
    } catch {
      set({ session: null, user: null, loading: false, initialized: true })
    }
  },
}))
