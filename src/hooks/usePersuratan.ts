import { useCallback, useEffect, useMemo, useState } from 'react'
import { getNaskahList, filterNaskah, countIncomplete } from '@/services/persuratan'
import type { NaskahItem, PersuratanFilter, DataSourceStatus } from '@/types/persuratan'
import { FILTER_DEFAULTS, JENIS_NASKAH_OPTIONS } from '@/types/persuratan'

const PAGE_SIZE = 15

interface PersuratanSummary {
  total: number
  masuk: number
  keluar: number
  tidakLengkap: number
}

interface UsePersuratanResult {
  isLoading: boolean
  dataSourceStatus: DataSourceStatus
  error: string | null
  lastUpdated: Date | null
  refetch: () => Promise<void>
  pageItems: NaskahItem[]
  totalResults: number
  page: number
  totalPages: number
  setPage: (p: number) => void
  filter: PersuratanFilter
  setFilter: (f: PersuratanFilter) => void
  resetFilter: () => void
  summary: PersuratanSummary
  /** Pilihan filter kelompok dan jenis naskah */
  kelompokOptions: string[]
  jenisOptions: string[]
}

export function usePersuratan(): UsePersuratanResult {
  const [allData, setAllData] = useState<NaskahItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataSourceStatus, setDataSourceStatus] = useState<DataSourceStatus>('not_connected')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<PersuratanFilter>(FILTER_DEFAULTS)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getNaskahList()
      setDataSourceStatus(result.status)
      setAllData(result.data)
      setLastUpdated(new Date())
      if (result.status === 'error') {
        setError(result.error ?? 'Gagal memuat data persuratan.')
      }
    } catch {
      setDataSourceStatus('error')
      setError('Gagal memuat data persuratan. Silakan muat ulang halaman.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const kelompokOptions = useMemo(
    () => Array.from(new Set(allData.map((n) => n.kelompokNaskah))).sort(),
    [allData],
  )

  const jenisOptions = useMemo(() => {
    // Gabungkan opsi baku dengan jenis unik lain jika ada dari dataset
    const set = new Set<string>(JENIS_NASKAH_OPTIONS)
    for (const item of allData) {
      if (item.jenisNaskah) set.add(item.jenisNaskah)
    }
    return Array.from(set)
  }, [allData])

  const filtered = useMemo(() => filterNaskah(allData, filter), [allData, filter])

  // Reset ke halaman 1 setiap filter berubah
  useEffect(() => { setPage(1) }, [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const summary = useMemo<PersuratanSummary>(() => ({
    total: allData.length,
    masuk: allData.filter((n) => n.kelompokNaskah === 'Naskah Masuk').length,
    keluar: allData.filter((n) => n.kelompokNaskah === 'Naskah Keluar').length,
    tidakLengkap: countIncomplete(allData),
  }), [allData])

  return {
    isLoading,
    dataSourceStatus,
    error,
    lastUpdated,
    refetch: loadData,
    pageItems,
    totalResults: filtered.length,
    page: safePage,
    totalPages,
    setPage,
    filter,
    setFilter,
    resetFilter: () => setFilter(FILTER_DEFAULTS),
    summary,
    kelompokOptions,
    jenisOptions,
  }
}
