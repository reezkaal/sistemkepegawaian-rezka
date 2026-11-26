import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv dengan prefix '' membaca SEMUA env var (termasuk tanpa VITE_).
  // Ini berjalan di Node.js saat konfigurasi, BUKAN di browser — aman.
  const env = loadEnv(mode, process.cwd(), '')
  const gasUrl = env.GOOGLE_APPS_SCRIPT_URL
  const supabaseUrl = env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

  /**
   * Dev-only plugin: intercept /api/employees dan /api/leave di Vite dev
   * server menggunakan Node.js fetch() yang mengikuti redirect (302) secara
   * server-side. Browser hanya menerima JSON final — tidak pernah melihat
   * 302 atau URL script.google.com/googleusercontent.com.
   *
   * Tidak ada efek pada production build — `apply: 'serve'` membatasi
   * plugin hanya aktif saat `npm run dev`.
   *
   * Jika GOOGLE_APPS_SCRIPT_URL tidak diisi, plugin tidak aktif dan
   * frontend fallback ke VITE_DATA_SOURCE=mock seperti biasa.
   */
  const devApiPlugin: Plugin = {
    name: 'dev-api-proxy',
    apply: 'serve',
    configureServer(server) {
      if (!gasUrl) return

      const TIMEOUT_MS = 45_000

      async function proxyToGas(resource: string): Promise<{ status: number; body: string }> {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
          // fetch() Node.js: redirect: 'follow' adalah default.
          // GAS 302 diselesaikan di sini — tidak diteruskan ke browser.
          const upstream = await fetch(`${gasUrl}?resource=${resource}`, {
            signal: controller.signal,
          })
          clearTimeout(timeout)

          if (!upstream.ok) {
            return {
              status: 502,
              body: JSON.stringify({ error: `Upstream HTTP ${upstream.status}` }),
            }
          }

          const data: unknown = await upstream.json()
          return { status: 200, body: JSON.stringify(data) }
        } catch (err: unknown) {
          clearTimeout(timeout)
          const isAbort = err instanceof Error && err.name === 'AbortError'
          return {
            status: isAbort ? 504 : 502,
            body: JSON.stringify({ error: isAbort ? 'Upstream timeout' : 'Proxy error' }),
          }
        }
      }

      async function verifyDevCaller(authHeader: string | undefined): Promise<{ ok: true; role: string; nip: string | null } | { ok: false; status: number; body: string }> {
        if (!supabaseUrl || !supabaseAnonKey) {
          return { ok: true, role: 'superadmin', nip: null }
        }
        if (!authHeader?.startsWith('Bearer ')) {
          return { ok: false, status: 401, body: JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }) }
        }
        const token = authHeader.slice(7).trim()
        const { createClient } = await import('@supabase/supabase-js')
        const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
        const { data: { user }, error } = await anonClient.auth.getUser(token)
        if (error || !user) {
          return { ok: false, status: 401, body: JSON.stringify({ error: 'Token tidak valid atau kedaluwarsa.' }) }
        }
        const profileClient = serviceRoleKey
          ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
          : createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
        const { data: profile } = await profileClient.from('profiles').select('role, nip').eq('id', user.id).single()
        if (!profile) {
          return { ok: false, status: 403, body: JSON.stringify({ error: 'Profil pengguna tidak ditemukan.' }) }
        }
        return { ok: true, role: profile.role as string, nip: (profile.nip as string | null) ?? null }
      }

      server.middlewares.use('/api/employees', (req, res, next) => {
        verifyDevCaller(req.headers.authorization)
          .then(async (auth) => {
            if (!auth.ok) {
              res.statusCode = auth.status
              res.setHeader('Content-Type', 'application/json')
              res.end(auth.body)
              return
            }
            const { status, body } = await proxyToGas('employees')
            if (status === 200 && auth.role === 'user') {
              try {
                const parsed = JSON.parse(body)
                if (Array.isArray(parsed)) {
                  const filtered = parsed.map((row: Record<string, unknown>) =>
                    auth.nip && row.nip === auth.nip
                      ? row
                      : {
                          nama: '(Terbatas)',
                          nip: '',
                          golongan: row.golongan,
                          status: row.status,
                          satker: row.satker,
                          bidangBagian: row.bidangBagian,
                          jenisKelamin: row.jenisKelamin,
                          tanggalLahir: row.tanggalLahir,
                          tingkatPendidikan: row.tingkatPendidikan,
                          statusAktif: row.statusAktif,
                        },
                  )
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(filtered))
                  return
                }
              } catch { /* fallback ke body asli */ }
            }
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
          .catch(next)
      })

      server.middlewares.use('/api/leave', (req, res, next) => {
        verifyDevCaller(req.headers.authorization)
          .then(async (auth) => {
            if (!auth.ok) {
              res.statusCode = auth.status
              res.setHeader('Content-Type', 'application/json')
              res.end(auth.body)
              return
            }
            const { status, body } = await proxyToGas('leave')
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
          .catch(next)
      })

      server.middlewares.use('/api/persuratan', (req, res, next) => {
        verifyDevCaller(req.headers.authorization)
          .then(async (auth) => {
            if (!auth.ok) {
              res.statusCode = auth.status
              res.setHeader('Content-Type', 'application/json')
              res.end(auth.body)
              return
            }
            const { status, body } = await proxyToGas('persuratan')
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
          .catch(next)
      })

      // Dev proxy untuk /api/auth/create-user
      server.middlewares.use('/api/auth/create-user', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                'SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env. Buka dashboard Supabase -> Project Settings -> API, salin kunci service_role, simpan di file .env, lalu restart dev server.',
            }),
          )
          return
        }

          try {
            // Baca request body
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            const body = JSON.parse(Buffer.concat(chunks).toString())

            const authHeader = req.headers.authorization
            if (!authHeader?.startsWith('Bearer ')) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }))
              return
            }

            // Dynamic import supaya tidak memaksa @supabase/supabase-js di Node
            const { createClient } = await import('@supabase/supabase-js')
            const callerToken = authHeader.slice(7)

            const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
              auth: { persistSession: false, autoRefreshToken: false },
            })
            const { data: { user: callerUser }, error: authErr } = await supabaseAnon.auth.getUser(callerToken)
            if (authErr || !callerUser) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Token tidak valid.' }))
              return
            }

            const supaAdmin = createClient(supabaseUrl, serviceRoleKey, {
              auth: { persistSession: false, autoRefreshToken: false },
            })

            const { data: profile } = await supaAdmin.from('profiles').select('role').eq('id', callerUser.id).single()
            const callerRole = profile?.role as string
            if (callerRole !== 'superadmin' && callerRole !== 'admin') {
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Tidak memiliki izin.' }))
              return
            }

            const { email, password, nama, nip, role } = body
            if (!email || !password || !nama || !role) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Field wajib tidak lengkap.' }))
              return
            }
            if (callerRole === 'admin' && role === 'superadmin') {
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Admin tidak dapat membuat Superadmin.' }))
              return
            }

            const { data: newUser, error: createErr } = await supaAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { nama, nip: nip || '', role },
            })

            if (createErr) {
              const status = createErr.message.includes('already') ? 409 : 400
              res.statusCode = status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: createErr.message }))
              return
            }

            if (newUser.user) {
              await supaAdmin.from('profiles').update({ role, nama, nip: nip || null }).eq('id', newUser.user.id)
            }

            res.statusCode = 201
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              id: newUser.user!.id,
              email: newUser.user!.email,
              nama,
              nip: nip || null,
              role,
            }))
          } catch (err) {
            next(err)
          }
        })

        // Dev proxy untuk /api/auth/manage-user
        server.middlewares.use('/api/auth/manage-user', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method Not Allowed' }))
            return
          }

          if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error:
                  'SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env. Buka dashboard Supabase -> Project Settings -> API, salin kunci service_role, simpan di file .env, lalu restart dev server.',
              }),
            )
            return
          }

          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            const body = JSON.parse(Buffer.concat(chunks).toString())

            const authHeader = req.headers.authorization
            if (!authHeader?.startsWith('Bearer ')) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }))
              return
            }

            const { createClient } = await import('@supabase/supabase-js')
            const callerToken = authHeader.slice(7)

            const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
              auth: { persistSession: false, autoRefreshToken: false },
            })
            const { data: { user: callerUser }, error: authErr } = await supabaseAnon.auth.getUser(callerToken)
            if (authErr || !callerUser) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Token tidak valid.' }))
              return
            }

            const supaAdmin = createClient(supabaseUrl, serviceRoleKey, {
              auth: { persistSession: false, autoRefreshToken: false },
            })

            const { data: profile } = await supaAdmin.from('profiles').select('role').eq('id', callerUser.id).single()
            const callerRole = profile?.role as string
            if (callerRole !== 'superadmin' && callerRole !== 'admin') {
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Tidak memiliki izin.' }))
              return
            }

            const { action, userId, nama, nip, role, newPassword } = body
            if (!action || !userId) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Parameter tidak lengkap.' }))
              return
            }

            const { data: targetProfile } = await supaAdmin.from('profiles').select('role').eq('id', userId).single()
            const targetRole = targetProfile?.role as string

            if (callerRole === 'admin' && targetRole === 'superadmin') {
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Admin tidak dapat mengelola Superadmin.' }))
              return
            }

            if (action === 'update') {
              if (callerRole === 'admin' && role === 'superadmin') {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Admin tidak dapat menetapkan role Superadmin.' }))
                return
              }

              await supaAdmin.from('profiles').update({
                nama: nama?.trim(),
                nip: nip?.trim() || null,
                role,
                updated_at: new Date().toISOString(),
              }).eq('id', userId)

              await supaAdmin.auth.admin.updateUserById(userId, {
                user_metadata: { nama: nama?.trim(), nip: nip?.trim() || '', role },
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
              return
            }

            if (action === 'reset-password') {
              if (!newPassword || newPassword.length < 6) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Password minimal 6 karakter.' }))
                return
              }

              const { error: resetErr } = await supaAdmin.auth.admin.updateUserById(userId, { password: newPassword })
              if (resetErr) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: resetErr.message }))
                return
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
              return
            }

            if (action === 'delete') {
              if (userId === callerUser.id) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Tidak dapat menghapus akun sendiri.' }))
                return
              }

              const { error: delErr } = await supaAdmin.auth.admin.deleteUser(userId)
              if (delErr) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: delErr.message }))
                return
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
              return
            }

            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Aksi tidak valid.' }))
          } catch (err) {
            next(err)
          }
        })
    },
  }

  return {
    plugins: [react(), devApiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
  }
})
