import { gzipSync } from 'node:zlib'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyCaller } from './_lib/auth.js'

/**
 * GET /api/persuratan
 *
 * Server-side proxy ke Google Apps Script (?resource=persuratan).
 * Memerlukan JWT Supabase yang valid pada header Authorization.
 * Response dikompresi dengan gzip jika client mendukung Accept-Encoding: gzip
 * agar payload 24.000+ baris tetap jauh di bawah batas 4.5 MB Vercel.
 */

const TIMEOUT_MS = 60_000

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const auth = await verifyCaller(req)
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL
  if (!gasUrl) {
    console.error('[api/persuratan] GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi.')
    res.status(503).json({ error: 'Service tidak tersedia. Hubungi administrator.' })
    return
  }

  const targetUrl = `${gasUrl}?resource=persuratan`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(targetUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!upstream.ok) {
      console.error(`[api/persuratan] GAS mengembalikan HTTP ${upstream.status}.`)
      res.status(502).json({ error: 'Gagal mengambil data dari sumber. Coba beberapa saat lagi.' })
      return
    }

    let data: unknown
    try {
      data = await upstream.json()
    } catch {
      console.error('[api/persuratan] Response dari GAS bukan JSON valid.')
      res.status(502).json({ error: 'Format response tidak valid dari sumber data.' })
      return
    }

    const jsonStr = JSON.stringify(data)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')

    const acceptsGzip = /\bgzip\b/i.test(String(req.headers['accept-encoding'] ?? ''))
    if (acceptsGzip) {
      const compressed = gzipSync(jsonStr)
      res.setHeader('Content-Encoding', 'gzip')
      res.status(200).send(compressed)
      return
    }

    res.status(200).send(jsonStr)
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[api/persuratan] Request ke GAS timeout setelah', TIMEOUT_MS, 'ms.')
      res.status(504).json({ error: 'Sumber data tidak merespons tepat waktu. Coba lagi.' })
    } else {
      console.error('[api/persuratan] Fetch error:', err instanceof Error ? err.message : 'unknown')
      res.status(502).json({ error: 'Gagal menghubungi sumber data.' })
    }
  }
}
