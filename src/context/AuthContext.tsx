import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AuthUser, AuthContextType, UserRole } from '@/types/auth'
import { validateMockCredentials } from '@/mock/authUsers'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_SESSION_KEY = 'ppsdmpu_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 1. Inisialisasi status sesi saat komponen mount
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!isMounted) return

          if (session?.user) {
            await loadSupabaseUserProfile(session.user.id, session.user.email ?? '', session.user.user_metadata)
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('[AuthContext] Gagal inisialisasi sesi Supabase:', err)
          setUser(null)
        } finally {
          if (isMounted) setIsLoading(false)
        }
      } else {
        // Fallback Mock Session (sebelum user memasukkan API key Supabase)
        try {
          const raw = sessionStorage.getItem(MOCK_SESSION_KEY)
          if (raw && isMounted) {
            const parsed = JSON.parse(raw)
            setUser(parsed)
          }
        } catch {
          setUser(null)
        } finally {
          if (isMounted) setIsLoading(false)
        }
      }
    }

    initAuth()

    // 2. Pasang event listener status login Supabase jika sudah dikonfigurasi
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return
        if (session?.user) {
          await loadSupabaseUserProfile(session.user.id, session.user.email ?? '', session.user.user_metadata)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      })

      return () => {
        isMounted = false
        authListener.subscription.unsubscribe()
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Helper untuk membaca profile dari tabel profiles / metadata Supabase
  const loadSupabaseUserProfile = async (
    userId: string,
    email: string,
    metadata?: Record<string, unknown>,
  ) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const role: UserRole = (profile?.role || metadata?.role || 'user') as UserRole
      const displayName = profile?.nama || metadata?.nama || metadata?.displayName || email.split('@')[0]
      const nip = profile?.nip || (metadata?.nip as string | undefined) || ''

      setUser({
        id: userId,
        email,
        nip,
        username: nip || email.split('@')[0],
        displayName,
        role,
      })
    } catch {
      // Fallback ke user_metadata jika tabel profiles belum dibuat / error RLS
      const role: UserRole = (metadata?.role || 'user') as UserRole
      const displayName = (metadata?.nama as string) || (metadata?.displayName as string) || email.split('@')[0]
      const nip = (metadata?.nip as string) || ''

      setUser({
        id: userId,
        email,
        nip,
        username: nip || email.split('@')[0],
        displayName,
        role,
      })
    }
  }

  // Fungsi Login
  const login = useCallback(
    async (
      usernameOrEmailOrNip: string,
      password: string,
    ): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true)

      if (isSupabaseConfigured) {
        try {
          const input = usernameOrEmailOrNip.trim()
          const cleanPassword = password.trim()

          // Siapkan daftar target email yang dicoba secara cerdas
          const candidateEmails: string[] = []

          if (input.includes('@')) {
            candidateEmails.push(input.toLowerCase())
          } else {
            const lowerInput = input.toLowerCase()

            // 1. Pemetaan NIP khusus
            if (lowerInput === '12345') {
              candidateEmails.push('admin@ppsdmpu.go.id')
            } else if (lowerInput === '123456789012345678') {
              candidateEmails.push('superadmin@ppsdmpu.go.id')
            }

            // 2. Domain resmi PPSDMPU (.go.id)
            candidateEmails.push(`${lowerInput}@ppsdmpu.go.id`)

            // 3. Domain internal & Kemenhub
            candidateEmails.push(`${lowerInput}@ppsdmpu.internal`)
            candidateEmails.push(`${lowerInput}@dephub.go.id`)
          }

          let lastErrorMessage = 'Username/NIP atau password salah.'

          for (const emailTarget of candidateEmails) {
            // Coba login dengan cleanPassword terlebih dahulu
            let { data, error } = await supabase.auth.signInWithPassword({
              email: emailTarget,
              password: cleanPassword,
            })

            // Jika gagal dan password asli berbeda karena whitespace, coba password asli
            if (error && cleanPassword !== password) {
              const retryRaw = await supabase.auth.signInWithPassword({
                email: emailTarget,
                password,
              })
              if (!retryRaw.error) {
                data = retryRaw.data
                error = null
              }
            }

            if (!error && data.user) {
              await loadSupabaseUserProfile(
                data.user.id,
                data.user.email ?? emailTarget,
                data.user.user_metadata,
              )
              return { success: true }
            }

            if (error && error.message !== 'Invalid login credentials') {
              lastErrorMessage = error.message
            }
          }

          return {
            success: false,
            message: lastErrorMessage,
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.'
          return { success: false, message: msg }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Mode Mock / Fallback
        await new Promise((r) => setTimeout(r, 350))
        const mock = validateMockCredentials(usernameOrEmailOrNip, password)
        if (!mock) {
          setIsLoading(false)
          return { success: false, message: 'Username/NIP atau password salah (Mode Mock).' }
        }

        const mockUser: AuthUser = {
          id: `mock-${mock.username}`,
          email: `${mock.username}@ppsdmpu.demo`,
          nip: mock.nip,
          username: mock.username,
          displayName: mock.displayName,
          role: mock.role,
        }

        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser))
        setUser(mockUser)
        setIsLoading(false)
        return { success: true }
      }
    },
    [],
  )

  // Fungsi Logout
  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      sessionStorage.removeItem(MOCK_SESSION_KEY)
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isLoading,
        isAuthenticated: Boolean(user),
        isConfigured: isSupabaseConfigured,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext harus digunakan di dalam <AuthProvider>')
  }
  return context
}

