import { useEffect, useMemo, useState } from 'react'
import { getEmployees } from '@/services/api'
import type { EmployeeListItem } from '@/types/employee'

const PAGE_SIZE = 5

/** Nilai kosong ('') berarti "Semua" - dropdown diisi dinamis dari data. */
export type SatkerFilter = string
export type BidangFilter = string
export type StatusKepegawaianFilter = string

interface UseEmployeeListResult {
  isLoading: boolean
  error: string | null
  /** Baris untuk halaman aktif saat ini (setelah search + filter + pagination). */
  pageItems: EmployeeListItem[]
  /** Jumlah total hasil setelah search + filter (sebelum pagination). */
  totalResults: number
  /** Pilihan Satker unik untuk dropdown filter, diturunkan dari data. */
  satkerOptions: string[]
  /** Pilihan Bidang/Bagian unik untuk dropdown filter, diturunkan dari data. */
  bidangOptions: string[]
  /** Pilihan Status Kepegawaian unik (mis. PNS, PPPK) diturunkan dari data. */
  statusOptions: string[]
  page: number
  totalPages: number
  setPage: (page: number) => void
  /** Ringkasan TIDAK terfilter (dihitung dari seluruh data), untuk summary strip halaman Pegawai. */
  summary: { total: number; totalPNS: number; totalPPPK: number }
}

/**
 * Data + state untuk halaman Daftar Pegawai (Checkpoint 3B), direvisi
 * pada CHECKPOINT A1 untuk mengikuti struktur sheet DUK asli: Satker dan
 * Bidang/Bagian adalah filter TERPISAH, dan filter Status memakai
 * Status Kepegawaian (PNS/PPPK dari kolom STATUS), bukan lagi
 * `statusAktif` (boolean).
 * Mengikuti arsitektur UI -> Hook -> Service -> Mock Data: hook ini
 * mengambil data mentah dari service layer, lalu melakukan
 * search/filter/pagination di sisi client (dataset kecil, mock).
 */
export function useEmployeeList(
  namaQuery: string,
  nipQuery: string,
  satkerFilter: SatkerFilter,
  bidangFilter: BidangFilter,
  statusFilter: StatusKepegawaianFilter,
): UseEmployeeListResult {
  const [allEmployees, setAllEmployees] = useState<EmployeeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError(null)

    getEmployees()
      .then((data) => {
        if (!isActive) return
        setAllEmployees(data)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat data pegawai. Silakan muat ulang halaman.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const satkerOptions = useMemo(() => {
    const values = new Set(allEmployees.map((e) => e.satker))
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [allEmployees])

  const bidangOptions = useMemo(() => {
    const values = new Set(
      allEmployees.map((e) => e.bidangBagian).filter((v): v is string => Boolean(v)),
    )
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [allEmployees])

  const statusOptions = useMemo(() => {
    const values = new Set(allEmployees.map((e) => e.statusKepegawaian))
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [allEmployees])

  const filtered = useMemo(() => {
    const nama = namaQuery.trim().toLowerCase()
    const nip = nipQuery.trim().toLowerCase()

    return allEmployees.filter((e) => {
      if (nama && !e.nama.toLowerCase().includes(nama)) return false
      if (nip && !e.nip.toLowerCase().includes(nip)) return false
      if (satkerFilter && e.satker !== satkerFilter) return false
      if (bidangFilter && e.bidangBagian !== bidangFilter) return false
      if (statusFilter && e.statusKepegawaian !== statusFilter) return false
      return true
    })
  }, [allEmployees, namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter])

  // Reset ke halaman 1 setiap kali search/filter berubah.
  useEffect(() => {
    setPage(1)
  }, [namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  // Ringkasan dari SELURUH data (bukan hasil filter) — dipakai summary
  // strip di atas tabel Pegawai. Murni turunan dari statusKepegawaian
  // yang sudah ada, bukan data baru.
  const summary = useMemo(() => {
    let totalPNS = 0
    let totalPPPK = 0
    for (const e of allEmployees) {
      if (e.statusKepegawaian === 'PNS') totalPNS += 1
      else if (e.statusKepegawaian === 'PPPK') totalPPPK += 1
    }
    return { total: allEmployees.length, totalPNS, totalPPPK }
  }, [allEmployees])

  return {
    isLoading,
    error,
    pageItems,
    totalResults: filtered.length,
    satkerOptions,
    bidangOptions,
    statusOptions,
    page: safePage,
    totalPages,
    setPage,
    summary,
  }
}
