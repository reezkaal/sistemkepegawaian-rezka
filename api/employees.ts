import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyCaller } from './_lib/auth.js'

/**
 * GET /api/employees
 *
 * Server-side proxy ke Google Apps Script.
 * Memerlukan JWT Supabase yang valid pada header Authorization.
 * - Role superadmin/admin: mendapatkan seluruh data pegawai.
 * - Role user: mendapatkan data penuh hanya untuk NIP miliknya sendiri;
 *   pegawai lain disaring ke field non-PII untuk kebutuhan grafik Dashboard.
 *
 * GOOGLE_APPS_SCRIPT_URL dibaca dari environment variable server-side
 * (Vercel dashboard) - tidak pernah dikirim ke browser.
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
    // Log server-side saja, tidak bocor ke response
    console.error('[api/employees] GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi.')
    res.status(503).json({ error: 'Service tidak tersedia. Hubungi administrator.' })
    return
  }

  const targetUrl = `${gasUrl}?resource=employees`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(targetUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!upstream.ok) {
      console.error(`[api/employees] GAS mengembalikan HTTP ${upstream.status}.`)
      res.status(502).json({ error: 'Gagal mengambil data dari sumber. Coba beberapa saat lagi.' })
      return
    }

    let data: unknown
    try {
      data = await upstream.json()
    } catch {
      console.error('[api/employees] Response dari GAS bukan JSON valid.')
      res.status(502).json({ error: 'Format response tidak valid dari sumber data.' })
      return
    }

    const payload =
      auth.role === 'user' && Array.isArray(data)
        ? data.map((row: Record<string, unknown>) => {
            if (auth.nip && row.nip === auth.nip) {
              return row
            }
            return {
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
              aktifBulanCount: row.aktifBulanCount,
              aktifMulai: row.aktifMulai,
              aktifSampai: row.aktifSampai,
              aktifPeriode: row.aktifPeriode,
            }
          })
        : data

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(payload)
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[api/employees] Request ke GAS timeout setelah', TIMEOUT_MS, 'ms.')
      res.status(504).json({ error: 'Sumber data tidak merespons tepat waktu. Coba lagi.' })
    } else {
      console.error('[api/employees] Fetch error:', err instanceof Error ? err.message : 'unknown')
      res.status(502).json({ error: 'Gagal menghubungi sumber data.' })
    }
  }
}
