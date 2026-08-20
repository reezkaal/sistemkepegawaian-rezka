import { useEffect, useMemo, useState } from 'react'
import { getLeaveHistory } from '@/services/api'
import type { LeaveHistoryEntry, StatusCuti } from '@/types/leave'

const PAGE_SIZE = 5

export type StatusCutiFilter = 'semua' | StatusCuti
export type TahunFilter = 'semua' | number

interface UseLeaveListResult {
  isLoading: boolean
  error: string | null
  pageItems: LeaveHistoryEntry[]
  totalResults: number
  jenisCutiOptions: string[]
  tahunOptions: number[]
  page: number
  totalPages: number
  setPage: (page: number) => void
}

/**
 * Data + state untuk halaman Cuti (Checkpoint 3C).
 * Mengikuti arsitektur UI -> Hook -> Service -> Mock Data: hook ini
 * mengambil data mentah dari service layer, lalu melakukan
 * search/filter/pagination di sisi client (dataset kecil, mock).
 */
export function useLeaveList(
  namaQuery: string,
  nipQuery: string,
  jenisCutiFilter: string,
  statusFilter: StatusCutiFilter,
  tahunFilter: TahunFilter,
): UseLeaveListResult {
  const [allEntries, setAllEntries] = useState<LeaveHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError(null)

    getLeaveHistory()
      .then((data) => {
        if (!isActive) return
        setAllEntries(data)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat data cuti. Silakan muat ulang halaman.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const jenisCutiOptions = useMemo(() => {
    const values = new Set(allEntries.map((e) => e.jenisCuti))
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [allEntries])

  const tahunOptions = useMemo(() => {
    const values = new Set(allEntries.map((e) => e.tahun))
    return Array.from(values).sort((a, b) => b - a)
  }, [allEntries])

  const filtered = useMemo(() => {
    const nama = namaQuery.trim().toLowerCase()
    const nip = nipQuery.trim().toLowerCase()

    return allEntries.filter((e) => {
      if (nama && !e.nama.toLowerCase().includes(nama)) return false
      if (nip && !e.nip.toLowerCase().includes(nip)) return false
      if (jenisCutiFilter && e.jenisCuti !== jenisCutiFilter) return false
      if (statusFilter !== 'semua' && e.status !== statusFilter) return false
      if (tahunFilter !== 'semua' && e.tahun !== tahunFilter) return false
      return true
    })
  }, [allEntries, namaQuery, nipQuery, jenisCutiFilter, statusFilter, tahunFilter])

  // Reset ke halaman 1 setiap kali search/filter berubah.
  useEffect(() => {
    setPage(1)
  }, [namaQuery, nipQuery, jenisCutiFilter, statusFilter, tahunFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  return {
    isLoading,
    error,
    pageItems,
    totalResults: filtered.length,
    jenisCutiOptions,
    tahunOptions,
    page: safePage,
    totalPages,
    setPage,
  }
}
