import type { VercelRequest } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export interface VerifiedCaller {
  ok: true
  userId: string
  role: 'superadmin' | 'admin' | 'user'
  nip: string | null
}

export interface AuthFailure {
  ok: false
  status: number
  error: string
}

/**
 * Memverifikasi JWT Supabase dari header Authorization dan mengambil role + NIP
 * pemanggil dari tabel public.profiles.
 */
export async function verifyCaller(req: VercelRequest): Promise<VerifiedCaller | AuthFailure> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('[api/_lib/auth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
    return {
      ok: false,
      status: 503,
      error: 'Konfigurasi autentikasi server belum lengkap.',
    }
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      error: 'Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    }
  }

  const callerToken = authHeader.slice(7).trim()
  if (!callerToken) {
    return {
      ok: false,
      status: 401,
      error: 'Token autentikasi tidak valid.',
    }
  }

  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user: callerUser }, error: authError } = await supabaseAnon.auth.getUser(callerToken)
  if (authError || !callerUser) {
    return {
      ok: false,
      status: 401,
      error: 'Sesi login tidak valid atau sudah kedaluwarsa.',
    }
  }

  // Gunakan serviceRoleKey jika tersedia, atau fallback ke client dengan JWT pemanggil (RLS mengizinkan baca profil sendiri)
  const profileClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${callerToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })

  const { data: profile, error: profileError } = await profileClient
    .from('profiles')
    .select('role, nip')
    .eq('id', callerUser.id)
    .single()

  if (profileError || !profile) {
    return {
      ok: false,
      status: 403,
      error: 'Profil pengguna tidak ditemukan.',
    }
  }

  return {
    ok: true,
    userId: callerUser.id,
    role: profile.role as 'superadmin' | 'admin' | 'user',
    nip: (profile.nip as string | null) ?? null,
  }
}
