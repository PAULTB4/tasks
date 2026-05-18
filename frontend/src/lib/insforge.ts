import { createClient } from '@insforge/sdk'

const baseUrl = import.meta.env.VITE_INSFORGE_BASE_URL || 'https://rv6f6n5q.us-east.insforge.app'
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

export const insforge = createClient({
  baseUrl,
  anonKey,
})
