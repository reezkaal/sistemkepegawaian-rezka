import { useEffect, useState } from 'react'
import { getLeaveSummaryByNip } from '@/services/api'
import type { LeaveRecord } from '@/types/leave'

/** Tahun berjalan yang dipakai untuk label N-2/N-1/N di "Ringkasan Cuti". */
export const TAHUN_BERJALAN = 2026

interface UseLeaveSummaryResult {
  record: LeaveRecord | null
  isLoading: boolean
  error: string | null
  /** true jika request selesai tapi belum ada data ringkasan cuti untuk pegawai ini. */
  notFound: boolean
}

/**
 * Data untuk bagian "Ringkasan Cuti" (N-2/N-1/N) di Detail Pegawai
 * (Checkpoint 3C). Mengikuti arsitektur UI -> Hook -> Service -> Mock
 * Data. Total Cuti TIDAK dihitung di sini - dihitung secara dinamis di
 * komponen UI dari nilai yang dikembalikan hook ini (lihat
 * docs/data-mapping.md § 6 untuk asumsi lengkap).
 */
export function useLeaveSummary(nip: string | undefined): UseLeaveSummaryResult {
  const [record, setRecord] = useState<LeaveRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!nip) {
      setRecord(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setError(null)

    getLeaveSummaryByNip(nip)
      .then((data) => {
        if (!isActive) return
        setRecord(data ?? null)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat ringkasan cuti. Silakan coba lagi.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [nip])

  return { record, isLoading, error, notFound: !isLoading && !error && !record }
}
