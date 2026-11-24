import { useAuthContext } from '@/context/AuthContext'
export type { AuthUser, UserRole } from '@/types/auth'

/**
 * Hook `useAuth` terpusat yang terhubung ke `AuthContext` (didukung Supabase Auth & Mock).
 */
export function useAuth() {
  return useAuthContext()
}
