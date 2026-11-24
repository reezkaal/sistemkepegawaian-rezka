export type UserRole = 'superadmin' | 'admin' | 'user'

export interface AuthUser {
  id: string
  email: string
  nip?: string
  username: string
  displayName: string
  role: UserRole
}

export interface AuthContextType {
  user: AuthUser | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  isConfigured: boolean
  login: (usernameOrEmailOrNip: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

