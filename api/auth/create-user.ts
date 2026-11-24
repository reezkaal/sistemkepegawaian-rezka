import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/create-user
 *
 * Serverless function untuk membuat user baru melalui Supabase Admin API.
 * Hanya bisa dipanggil oleh user dengan role superadmin atau admin.
 * Admin tidak bisa membuat akun superadmin.
 *
 * SUPABASE_SERVICE_ROLE_KEY diakses dari env var server-side (Vercel dashboard).
 */

interface CreateUserPayload {
  email: string
  password: string
  nama: string
  nip?: string
  role: 'superadmin' | 'admin' | 'user'
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Hanya terima POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('[api/auth/create-user] Missing Supabase environment variables.')
    res.status(503).json({ error: 'Service tidak tersedia. Konfigurasi Supabase belum lengkap.' })
    return
  }

  // 1. Validasi JWT caller dari Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' })
    return
  }

  const callerToken = authHeader.slice(7)

  // Client dengan anon key untuk verifikasi JWT caller
  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user: callerUser }, error: authError } = await supabaseAnon.auth.getUser(callerToken)
  if (authError || !callerUser) {
    res.status(401).json({ error: 'Token tidak valid atau sudah expired.' })
    return
  }

  // 2. Ambil role caller dari tabel profiles
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: callerProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', callerUser.id)
    .single()

  if (profileError || !callerProfile) {
    res.status(403).json({ error: 'Profil pengguna tidak ditemukan.' })
    return
  }

  const callerRole = callerProfile.role as string

  // 3. Hanya superadmin dan admin yang boleh membuat user
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    res.status(403).json({ error: 'Anda tidak memiliki izin untuk membuat pengguna.' })
    return
  }

  // 4. Validasi payload
  const { email, password, nama, nip, role } = req.body as CreateUserPayload

  if (!email || !password || !nama || !role) {
    res.status(400).json({ error: 'Field email, password, nama, dan role wajib diisi.' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password minimal 6 karakter.' })
    return
  }

  const validRoles = ['superadmin', 'admin', 'user']
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Role tidak valid. Pilih: superadmin, admin, atau user.' })
    return
  }

  // 5. Admin tidak boleh membuat superadmin
  if (callerRole === 'admin' && role === 'superadmin') {
    res.status(403).json({ error: 'Admin tidak dapat membuat akun Superadmin.' })
    return
  }

  // 6. Buat user via Supabase Admin API
  try {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama, nip: nip || '', role },
    })

    if (createError) {
      // Handle duplicate email
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        res.status(409).json({ error: 'Email sudah terdaftar.' })
        return
      }
      console.error('[api/auth/create-user] Create error:', createError.message)
      res.status(400).json({ error: createError.message })
      return
    }

    if (!newUser.user) {
      res.status(500).json({ error: 'Gagal membuat pengguna.' })
      return
    }

    // 7. Update profile yang dibuat oleh trigger (set role dan nip yang benar)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role, nama, nip: nip || null })
      .eq('id', newUser.user.id)

    if (updateError) {
      console.error('[api/auth/create-user] Profile update error:', updateError.message)
      // User sudah dibuat di auth.users, profile akan punya default dari trigger
    }

    res.status(201).json({
      id: newUser.user.id,
      email: newUser.user.email,
      nama,
      nip: nip || null,
      role,
    })
  } catch (err: unknown) {
    console.error('[api/auth/create-user] Unexpected error:', err instanceof Error ? err.message : 'unknown')
    res.status(500).json({ error: 'Terjadi kesalahan internal.' })
  }
}

