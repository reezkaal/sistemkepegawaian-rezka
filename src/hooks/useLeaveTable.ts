import { useEffect, useMemo, useState } from 'react'
import { getLeaveRecords } from '@/services/api'
import type { LeaveRecord, LeaveYearValue } from '@/types/leave'

/**
 * CHECKPOINT A3 — Data + state untuk halaman /cuti.
 *
 * Menampilkan Nilai Cuti Tahunan (N-2/N-1/N) dari sheet
 * "NILAI CUTI TAHUNAN - AWAL TAHUN" di DUK_Copy.xlsx.
 *
 * Setiap baris = satu pegawai + nilai N-2/N-1/N untuk tahun yang dipilih.
 * Jika pegawai tidak punya entri untuk tahun tersebut, nilai ditampilkan "-".
 *
 * Filter: Cari Nama, Cari NIP, pilih Tahun (statis 2024–2033).
 * Tidak ada filter Jenis Cuti / Status karena data tersebut tidak tersedia di DUK.
 */

const PAGE_SIZE = 10

/** Rentang tahun sesuai DUK_Copy.xlsx sheet "NILAI CUTI TAHUNAN - AWAL TAHUN". */
export const TAHUN_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033] as const
export type TahunCuti = (typeof TAHUN_OPTIONS)[number]

/** Arah sorting kolom Nama Pegawai. `null` = urutan asli (belum di-sort). */
export type NamaSortDirection = 'asc' | 'desc' | null

export interface LeaveTableRow {
  nip: string
  nama: string
  unitKerja: string
  tahun: number
  nMinus2: number | undefined
  nMinus1: number | undefined
  n: number | undefined
}

interface UseLeaveTableResult {
  isLoading: boolean
  error: string | null
  pageItems: LeaveTableRow[]
  totalResults: number
  page: number
  totalPages: number
  setPage: (page: number) => void
  /** Arah sorting kolom Nama Pegawai saat ini (`null` = belum di-sort). */
  namaSortDirection: NamaSortDirection
  /** Toggle sorting Nama: null -> asc -> desc -> null. */
  onToggleNamaSort: () => void
}

function recordToRow(record: LeaveRecord, tahun: number): LeaveTableRow {
  const yearValue: LeaveYearValue | undefined = record.nilaiTahunan.find(
    (v) => v.tahun === tahun,
  )
  return {
    nip: record.nip,
    nama: record.nama,
    unitKerja: record.unitKerja,
    tahun,
    nMinus2: yearValue?.nMinus2,
    nMinus1: yearValue?.nMinus1,
    n: yearValue?.n,
  }
}

export function useLeaveTable(
  namaQuery: string,
  nipQuery: string,
  tahunFilter: number,
): UseLeaveTableResult {
  const [allRecords, setAllRecords] = useState<LeaveRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [namaSortDirection, setNamaSortDirection] = useState<NamaSortDirection>(null)

  // Toggle sorting Nama: klik 1=A-Z, klik 2=Z-A, klik 3=kembali ke urutan
  // default/asli API. Reset ke halaman 1 dilakukan LANGSUNG di sini (bukan
  // lewat useEffect terpisah) supaya perubahan arah sort & halaman terjadi
  // dalam satu batch render yang sama — tidak ada frame antara di mana
  // tabel sempat menampilkan potongan (slice) lama dari halaman non-1.
  const onToggleNamaSort = () => {
    setNamaSortDirection((prev) => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null))
    setPage(1)
  }

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError(null)

    getLeaveRecords()
      .then((data) => {
        if (!isActive) return
        setAllRecords(data)
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

  // Reset ke halaman 1 setiap kali filter berubah. Perubahan sorting TIDAK
  // dimasukkan di sini — itu ditangani langsung di dalam `onToggleNamaSort`
  // di atas supaya sinkron dalam satu batch render.
  useEffect(() => {
    setPage(1)
  }, [namaQuery, nipQuery, tahunFilter])

  const filtered = useMemo(() => {
    const nama = namaQuery.trim().toLowerCase()
    const nip = nipQuery.trim().toLowerCase()

    // .filter() + .map() TIDAK mengubah urutan baris yang lolos filter dan
    // TIDAK memutasi `allRecords` — hasilnya tetap mengikuti urutan asli
    // sebagaimana diterima dari API (`getLeaveRecords()`).
    return allRecords
      .filter((r) => {
        if (nama && !r.nama.toLowerCase().includes(nama)) return false
        if (nip && !r.nip.toLowerCase().includes(nip)) return false
        return true
      })
      .map((r) => recordToRow(r, tahunFilter))
  }, [allRecords, namaQuery, nipQuery, tahunFilter])

  // `filtered` adalah dataset SUMBER yang tidak pernah diurutkan/dimutasi —
  // ia HANYA turunan search/filter dari `allRecords` (urutan asli API).
  // Saat `namaSortDirection === null` (default), `sorted` mengembalikan
  // `filtered` APA ADANYA — tanpa ada bekas array hasil sort sebelumnya
  // yang tercampur/tertinggal, karena `filtered` sendiri tidak pernah
  // disentuh oleh operasi sort/reverse manapun.
  //
  // Saat asc/desc aktif: SELALU sort di atas SALINAN (`[...filtered]`),
  // bukan `.sort()` langsung pada `filtered`/`allRecords` — sehingga
  // dataset asli tetap utuh untuk dipakai kembali saat sorting direset.
  // Sorting diterapkan pada SELURUH dataset hasil filter (bukan hanya
  // baris yang sedang tampil di halaman aktif), dan tetap kompatibel
  // dengan pagination yang sudah ada — hanya urutan yang berubah sebelum
  // dipotong per halaman di bawah.
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

  return {
    isLoading,
    error,
    pageItems,
    totalResults: filtered.length,
    page: safePage,
    totalPages,
    setPage,
    namaSortDirection,
    onToggleNamaSort,
  }
}
