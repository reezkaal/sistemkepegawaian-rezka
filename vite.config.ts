import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv dengan prefix '' membaca SEMUA env var (termasuk tanpa VITE_).
  // Ini berjalan di Node.js saat konfigurasi, BUKAN di browser — aman.
  const env = loadEnv(mode, process.cwd(), '')
  const gasUrl = env.GOOGLE_APPS_SCRIPT_URL

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

      server.middlewares.use('/api/employees', (_req, res, next) => {
        proxyToGas('employees')
          .then(({ status, body }) => {
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
          .catch(next)
      })

      server.middlewares.use('/api/leave', (_req, res, next) => {
        proxyToGas('leave')
          .then(({ status, body }) => {
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
          .catch(next)
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
