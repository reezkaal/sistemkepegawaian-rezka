import { useEffect, useState } from 'react'
import { getEmployeeChartData } from '@/services/api'
import type { EmployeeChartData } from '@/types/dashboard'

interface UseEmployeeChartsResult {
  data: EmployeeChartData | null
  isLoading: boolean
  error: string | null
}

/**
 * Data untuk 5 chart analitik kepegawaian di Dashboard.
 * Mengikuti arsitektur UI → Hook → Service → Mock Data.
 */
export function useEmployeeCharts(): UseEmployeeChartsResult {
  const [data, setData] = useState<EmployeeChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError(null)

    getEmployeeChartData()
      .then((result) => {
        if (!isActive) return
        setData(result)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat data chart. Silakan muat ulang halaman.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return { data, isLoading, error }
}
