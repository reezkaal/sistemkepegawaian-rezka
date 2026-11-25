import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ProfileUser {
  id: string
  email?: string
  nama: string
  nip: string | null
  role: 'superadmin' | 'admin' | 'user'
  created_at: string
}

export interface CreateUserPayload {
  email: string
  password: string
  nama: string
  nip?: string
  role: 'superadmin' | 'admin' | 'user'
}

/**
 * Ambil daftar semua user dari tabel profiles.
 * RLS policy sudah mengizinkan authenticated user membaca seluruh profiles.
 */
export async function listUsers(): Promise<ProfileUser[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nama, nip, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProfileUser[]
}

/**
 * Buat user baru melalui serverless function /api/auth/create-user.
 * Mengirim JWT caller di Authorization header untuk otorisasi server-side.
 */
export async function createUser(payload: CreateUserPayload): Promise<ProfileUser> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Anda harus login terlebih dahulu.')

  const response = await fetch('/api/auth/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  })

  let result: Record<string, unknown> = {}
  try {
    result = await response.json()
  } catch {
    throw new Error(
      `Server mengembalikan respon tidak valid (HTTP ${response.status}). Pastikan SUPABASE_SERVICE_ROLE_KEY sudah ada di .env dan dev server sudah direstart.`
    )
  }

  if (!response.ok) {
    throw new Error((result.error as string) || 'Gagal membuat pengguna.')
  }

  return result as unknown as ProfileUser
}

/**
 * Update data profil & metadata user (Nama, NIP, Role).
 */
export async function updateUser(
  userId: string,
  payload: { nama: string; nip?: string; role: 'superadmin' | 'admin' | 'user' },
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sesi autentikasi tidak ditemukan.')

  const response = await fetch('/api/auth/manage-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'update',
      userId,
      ...payload,
    }),
  })

  let result: Record<string, unknown> = {}
  try {
    result = await response.json()
  } catch {
    throw new Error(`Respon server tidak valid (HTTP ${response.status}).`)
  }
  if (!response.ok) {
    throw new Error((result.error as string) || 'Gagal memperbarui pengguna.')
  }
}

/**
 * Reset password pengguna oleh Admin / Superadmin.
 */
export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sesi autentikasi tidak ditemukan.')

  const response = await fetch('/api/auth/manage-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'reset-password',
      userId,
      newPassword,
    }),
  })

  let result: Record<string, unknown> = {}
  try {
    result = await response.json()
  } catch {
    throw new Error(`Respon server tidak valid (HTTP ${response.status}).`)
  }
  if (!response.ok) {
    throw new Error((result.error as string) || 'Gagal mereset password.')
  }
}

/**
 * Hapus akun pengguna.
 */
export async function deleteUser(userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sesi autentikasi tidak ditemukan.')

  const response = await fetch('/api/auth/manage-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'delete',
      userId,
    }),
  })

  let result: Record<string, unknown> = {}
  try {
    result = await response.json()
  } catch {
    throw new Error(`Respon server tidak valid (HTTP ${response.status}).`)
  }
  if (!response.ok) {
    throw new Error((result.error as string) || 'Gagal menghapus pengguna.')
  }
}

/**
 * Ganti password mandiri oleh pengguna yang sedang login.
 * Memverifikasi password lama terlebih dahulu sebelum mengubah password.
 */
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi.')
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.email) {
    throw new Error('Sesi pengguna tidak ditemukan. Silakan login kembali.')
  }

  // Verifikasi ulang password lama
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    throw new Error('Password lama tidak sesuai.')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}

