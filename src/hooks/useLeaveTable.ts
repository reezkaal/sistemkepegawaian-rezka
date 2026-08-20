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

  // Reset ke halaman 1 setiap kali filter berubah.
  useEffect(() => {
    setPage(1)
  }, [namaQuery, nipQuery, tahunFilter])

  const filtered = useMemo(() => {
    const nama = namaQuery.trim().toLowerCase()
    const nip = nipQuery.trim().toLowerCase()

    return allRecords
      .filter((r) => {
        if (nama && !r.nama.toLowerCase().includes(nama)) return false
        if (nip && !r.nip.toLowerCase().includes(nip)) return false
        return true
      })
      .map((r) => recordToRow(r, tahunFilter))
  }, [allRecords, namaQuery, nipQuery, tahunFilter])

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
    page: safePage,
    totalPages,
    setPage,
  }
}
