import { useState, useEffect, useCallback } from 'react'
import { validateMockCredentials } from '@/mock/authUsers'

/**
 * useAuth - PROTOTYPE ONLY.
 *
 * Lihat docs/authentication.md untuk penjelasan lengkap pendekatan dan
 * keterbatasannya. Ringkasnya: ini bukan authentication production-grade.
 * Validasi credential saat ini memakai mock users (src/mock/authUsers.ts)
 * — tidak ada data sensitif nyata yang terlibat. Saat backend/Apps Script
 * tersedia (Checkpoint 5+), fungsi `login` di bawah ini yang perlu diganti
 * untuk memanggil API sungguhan.
 *
 * Session disimpan di sessionStorage supaya:
 * - refresh halaman TIDAK menghapus status login (selama tab masih terbuka)
 * - menutup tab akan mengakhiri sesi (disengaja, bukan bug)
 */

const SESSION_KEY = 'ppsdmpu_session'

interface Session {
  active: true
  username: string
  displayName: string
  loginAt: string
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (parsed?.active) return parsed
    return null
  } catch {
    // sessionStorage tidak tersedia atau data korup - anggap belum login
    return null
  }
}

export interface AuthUser {
  username: string
  displayName: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const session = readSession()
    setUser(session ? { username: session.username, displayName: session.displayName } : null)
    setIsLoading(false)
  }, [])

  /**
   * Mencoba login dengan mock credentials.
   * Mengembalikan `{ success: true }` atau `{ success: false, message }`.
   * Simulasi delay singkat agar UI loading state terasa realistis dan
   * konsisten dengan pola async di src/services/api.ts.
   */
  const login = useCallback(
    async (usernameOrNip: string, password: string): Promise<{ success: boolean; message?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 400))

      const matched = validateMockCredentials(usernameOrNip, password)
      if (!matched) {
        return { success: false, message: 'Username/NIP atau password salah.' }
      }

      const session: Session = {
        active: true,
        username: matched.username,
        displayName: matched.displayName,
        loginAt: new Date().toISOString(),
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setUser({ username: matched.username, displayName: matched.displayName })
      return { success: true }
    },
    [],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return {
    isAuthenticated: user !== null,
    user,
    isLoading,
    login,
    logout,
  }
}
