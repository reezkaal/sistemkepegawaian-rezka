import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * GET /api/leave
 *
 * Server-side proxy ke Google Apps Script.
 * GOOGLE_APPS_SCRIPT_URL dibaca dari environment variable server-side
 * (Vercel dashboard) - tidak pernah dikirim ke browser.
 *
 * Tidak ada URL GAS yang bocor ke response atau log production.
 */

const TIMEOUT_MS = 35_000

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL
  if (!gasUrl) {
    // Log server-side saja, tidak bocor ke response
    console.error('[api/leave] GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi.')
    res.status(503).json({ error: 'Service tidak tersedia. Hubungi administrator.' })
    return
  }

  const targetUrl = `${gasUrl}?resource=leave`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(targetUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!upstream.ok) {
      console.error(`[api/leave] GAS mengembalikan HTTP ${upstream.status}.`)
      res.status(502).json({ error: 'Gagal mengambil data dari sumber. Coba beberapa saat lagi.' })
      return
    }

    let data: unknown
    try {
      data = await upstream.json()
    } catch {
      console.error('[api/leave] Response dari GAS bukan JSON valid.')
      res.status(502).json({ error: 'Format response tidak valid dari sumber data.' })
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(data)
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[api/leave] Request ke GAS timeout setelah', TIMEOUT_MS, 'ms.')
      res.status(504).json({ error: 'Sumber data tidak merespons tepat waktu. Coba lagi.' })
    } else {
      console.error('[api/leave] Fetch error:', err instanceof Error ? err.message : 'unknown')
      res.status(502).json({ error: 'Gagal menghubungi sumber data.' })
    }
  }
}
