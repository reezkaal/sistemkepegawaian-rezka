import { useCallback, useEffect, useMemo, useState } from 'react'
import { getEmployees } from '@/services/api'
import type { EmployeeListItem } from '@/types/employee'

const PAGE_SIZE = 10

/** Nilai kosong ('') berarti "Semua" - dropdown diisi dinamis dari data. */
export type SatkerFilter = string
export type BidangFilter = string
export type StatusKepegawaianFilter = string

/** Arah sorting kolom Nama. `null` = urutan asli (belum di-sort). */
export type NamaSortDirection = 'asc' | 'desc' | null

interface UseEmployeeListResult {
  isLoading: boolean
  error: string | null
  refreshError: string | null
  clearRefreshError: () => void
  lastUpdated: Date | null
  refetch: () => Promise<void>
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
  /** Arah sorting kolom Nama saat ini (`null` = belum di-sort). */
  namaSortDirection: NamaSortDirection
  /** Toggle sorting Nama: null -> asc -> desc -> null. */
  onToggleNamaSort: () => void
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
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [page, setPage] = useState(1)
  const [namaSortDirection, setNamaSortDirection] = useState<NamaSortDirection>(null)

  const clearRefreshError = useCallback(() => {
    setRefreshError(null)
  }, [])

  const loadData = useCallback(async (isRefresh = false) => {
    setIsLoading(true)
    if (isRefresh) {
      setRefreshError(null)
    } else {
      setError(null)
    }

    try {
      const data = await getEmployees(isRefresh ? { forceRefresh: true } : undefined)
      setAllEmployees(data)
      setLastUpdated(new Date())
      if (!isRefresh) {
        setError(null)
      }
      setRefreshError(null)
    } catch {
      if (isRefresh) {
        setRefreshError('Gagal memperbarui data pegawai. Silakan coba lagi.')
      } else {
        setError('Gagal memuat data pegawai. Silakan muat ulang halaman.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(false)
  }, [loadData])

  const refetch = useCallback(async () => {
    if (isLoading) return
    await loadData(true)
  }, [isLoading, loadData])

  // Toggle sorting Nama: klik 1=A-Z, klik 2=Z-A, klik 3=kembali ke urutan
  // default/asli API. Reset ke halaman 1 dilakukan LANGSUNG di sini (bukan
  // lewat useEffect terpisah) supaya perubahan arah sort & halaman terjadi
  // dalam satu batch render yang sama — tidak ada frame antara di mana
  // tabel sempat menampilkan potongan (slice) lama dari halaman non-1.
  const onToggleNamaSort = () => {
    setNamaSortDirection((prev) => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null))
    setPage(1)
  }

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

    // .filter() TIDAK mengubah urutan elemen yang lolos filter dan TIDAK
    // memutasi `allEmployees` — hasilnya tetap mengikuti urutan asli
    // sebagaimana diterima dari API (`getEmployees()`), hanya dikurangi
    // baris yang tidak lolos search/filter.
    return allEmployees.filter((e) => {
      if (nama && !e.nama.toLowerCase().includes(nama)) return false
      if (nip && !e.nip.toLowerCase().includes(nip)) return false
      if (satkerFilter && e.satker !== satkerFilter) return false
      if (bidangFilter && e.bidangBagian !== bidangFilter) return false
      if (statusFilter && e.statusKepegawaian !== statusFilter) return false
      return true
    })
  }, [allEmployees, namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter])

  // Reset ke halaman 1 setiap kali search/filter berubah. Perubahan sorting
  // TIDAK dimasukkan di sini — itu ditangani langsung di dalam
  // `onToggleNamaSort` di atas supaya sinkron dalam satu batch render.
  useEffect(() => {
    setPage(1)
  }, [namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter])

  // `filtered` adalah dataset SUMBER yang tidak pernah diurutkan/dimutasi —
  // ia HANYA turunan search/filter dari `allEmployees` (urutan asli API).
  // Saat `namaSortDirection === null` (default), `sorted` mengembalikan
  // `filtered` APA ADANYA — tanpa ada bekas array hasil sort sebelumnya
  // yang tercampur/tertinggal, karena `filtered` sendiri tidak pernah
  // disentuh oleh operasi sort/reverse manapun.
  //
  // Saat asc/desc aktif: SELALU sort di atas SALINAN (`[...filtered]`),
  // bukan `.sort()` langsung pada `filtered`/`allEmployees` — sehingga
  // dataset asli tetap utuh untuk dipakai kembali saat sorting direset.
  // Sorting diterapkan pada SELURUH dataset hasil filter (bukan hanya
  // baris yang sedang tampil di halaman aktif), baru kemudian dipotong
  // per halaman di bawah.
  const sorted = useMemo(() => {
    if (namaSortDirection === null) return filtered
    const collator = new Intl.Collator('id', { sensitivity: 'base' })
    const result = [...filtered].sort((a, b) => collator.compare(a.nama, b.nama))
    return namaSortDirection === 'desc' ? result.reverse() : result
  }, [filtered, namaSortDirection])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, safePage])

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
    refreshError,
    clearRefreshError,
    lastUpdated,
    refetch,
    pageItems,
    totalResults: filtered.length,
    satkerOptions,
    bidangOptions,
    statusOptions,
    page: safePage,
    totalPages,
    setPage,
    summary,
    namaSortDirection,
    onToggleNamaSort,
  }
}
