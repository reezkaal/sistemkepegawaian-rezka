import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/manage-user
 *
 * Endpoint serverless untuk aksi manajemen user oleh Superadmin / Admin:
 * - action: 'update' (ubah nama, nip, role)
 * - action: 'reset-password' (atur password baru pengguna)
 * - action: 'delete' (hapus akun pengguna)
 */

interface ManageUserPayload {
  action: 'update' | 'reset-password' | 'delete'
  userId: string
  nama?: string
  nip?: string
  role?: 'superadmin' | 'admin' | 'user'
  newPassword?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('[api/auth/manage-user] Supabase environment variables not configured.')
    res.status(503).json({ error: 'Service tidak tersedia. Konfigurasi server belum lengkap.' })
    return
  }

  // 1. Verifikasi JWT pemanggil
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' })
    return
  }

  const callerToken = authHeader.slice(7)
  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user: callerUser }, error: authError } = await supabaseAnon.auth.getUser(callerToken)
  if (authError || !callerUser) {
    res.status(401).json({ error: 'Sesi login tidak valid atau sudah kedaluwarsa.' })
    return
  }

  // 2. Ambil profil pemanggil
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: callerProfile, error: callerProfileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', callerUser.id)
    .single()

  if (callerProfileErr || !callerProfile) {
    res.status(403).json({ error: 'Profil pemanggil tidak ditemukan.' })
    return
  }

  const callerRole = callerProfile.role as string
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk aksi ini.' })
    return
  }

  const { action, userId, nama, nip, role, newPassword } = req.body as ManageUserPayload

  if (!action || !userId) {
    res.status(400).json({ error: 'Parameter action dan userId wajib diisi.' })
    return
  }

  // 3. Ambil data profil target user
  const { data: targetProfile, error: targetProfileErr } = await supabaseAdmin
    .from('profiles')
    .select('role, nama')
    .eq('id', userId)
    .single()

  if (targetProfileErr || !targetProfile) {
    res.status(404).json({ error: 'Pengguna target tidak ditemukan.' })
    return
  }

  const targetRole = targetProfile.role as string

  // 4. Pembatasan Hak Akses: Admin tidak boleh mengubah/mereset/menghapus Superadmin
  if (callerRole === 'admin' && targetRole === 'superadmin') {
    res.status(403).json({ error: 'Admin tidak memiliki izin untuk mengelola akun Superadmin.' })
    return
  }

  // Admin tidak boleh menaikkan role target menjadi superadmin
  if (callerRole === 'admin' && role === 'superadmin') {
    res.status(403).json({ error: 'Admin tidak dapat menetapkan role Superadmin.' })
    return
  }

  // 5. Eksekusi Aksi
  try {
    switch (action) {
      case 'update': {
        if (!nama || !role) {
          res.status(400).json({ error: 'Nama dan role wajib diisi.' })
          return
        }

        const validRoles = ['superadmin', 'admin', 'user']
        if (!validRoles.includes(role)) {
          res.status(400).json({ error: 'Role tidak valid.' })
          return
        }

        // Update database profiles
        const { error: updateProfileErr } = await supabaseAdmin
          .from('profiles')
          .update({
            nama: nama.trim(),
            nip: nip?.trim() || null,
            role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateProfileErr) {
          res.status(400).json({ error: updateProfileErr.message })
          return
        }

        // Update user_metadata di auth.users agar sinkron
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            nama: nama.trim(),
            nip: nip?.trim() || '',
            role,
          },
        })

        res.status(200).json({ success: true, message: 'Data pengguna berhasil diperbarui.' })
        return
      }

      case 'reset-password': {
        if (!newPassword || newPassword.length < 6) {
          res.status(400).json({ error: 'Password baru minimal 6 karakter.' })
          return
        }

        const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword,
        })

        if (resetErr) {
          res.status(400).json({ error: resetErr.message })
          return
        }

        res.status(200).json({ success: true, message: 'Password pengguna berhasil direset.' })
        return
      }

      case 'delete': {
        // Cegah menghapus akun sendiri
        if (userId === callerUser.id) {
          res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' })
          return
        }

        const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteErr) {
          res.status(400).json({ error: deleteErr.message })
          return
        }

        res.status(200).json({ success: true, message: 'Akun pengguna berhasil dihapus.' })
        return
      }

      default:
        res.status(400).json({ error: 'Aksi tidak dikenali.' })
        return
    }
  } catch (err: unknown) {
    console.error('[api/auth/manage-user] Error:', err)
    res.status(500).json({ error: 'Terjadi kesalahan sistem internal.' })
  }
}

