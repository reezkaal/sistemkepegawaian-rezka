import { useEffect, useState } from 'react'
import { getLeaveHistoryByNip } from '@/services/api'
import type { LeaveHistoryEntry } from '@/types/leave'

interface UseLeaveHistoryResult {
  entries: LeaveHistoryEntry[]
  isLoading: boolean
  error: string | null
}

/**
 * Data untuk bagian "Riwayat Cuti" di Detail Pegawai (Checkpoint 3C).
 * Mengikuti arsitektur UI -> Hook -> Service -> Mock Data. Array kosong
 * (setelah loading selesai tanpa error) berarti belum ada riwayat cuti
 * - komponen UI menampilkan "Belum terdapat riwayat cuti."
 */
export function useLeaveHistoryByEmployee(nip: string | undefined): UseLeaveHistoryResult {
  const [entries, setEntries] = useState<LeaveHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!nip) {
      setEntries([])
      setIsLoading(false)
      setError(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setError(null)

    getLeaveHistoryByNip(nip)
      .then((data) => {
        if (!isActive) return
        setEntries(data)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat riwayat cuti. Silakan coba lagi.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [nip])

  return { entries, isLoading, error }
}
