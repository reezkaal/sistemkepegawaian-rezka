import { useEffect, useState } from 'react'
import { searchEmployees } from '@/services/api'
import type { EmployeeListItem } from '@/types/employee'

const DEBOUNCE_MS = 250

interface UseEmployeeSearchResult {
  results: EmployeeListItem[]
  isLoading: boolean
  error: string | null
}

/**
 * Pencarian pegawai (nama/NIP) untuk Quick Search di Dashboard.
 * Mengikuti arsitektur UI -> Hook -> Service -> Mock Data.
 */
export function useEmployeeSearch(query: string): UseEmployeeSearchResult {
  const [results, setResults] = useState<EmployeeListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const keyword = query.trim()

    if (!keyword) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      searchEmployees(keyword)
        .then((data) => {
          if (!isActive) return
          setResults(data)
        })
        .catch(() => {
          if (!isActive) return
          setError('Gagal mencari pegawai. Silakan coba lagi.')
        })
        .finally(() => {
          if (!isActive) return
          setIsLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      isActive = false
      clearTimeout(timeoutId)
    }
  }, [query])

  return { results, isLoading, error }
}
