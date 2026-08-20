import { useEffect, useState } from 'react'
import { getEmployeeByNip } from '@/services/api'
import type { Employee } from '@/types/employee'

interface UseEmployeeDetailResult {
  employee: Employee | null
  isLoading: boolean
  error: string | null
  /** true jika request selesai tapi tidak ada pegawai dengan NIP tersebut. */
  notFound: boolean
}

/**
 * Data untuk halaman Detail Pegawai (Checkpoint 3B).
 * Mengikuti arsitektur UI -> Hook -> Service -> Mock Data.
 */
export function useEmployeeDetail(nip: string | undefined): UseEmployeeDetailResult {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!nip) {
      setEmployee(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setError(null)

    getEmployeeByNip(nip)
      .then((data) => {
        if (!isActive) return
        setEmployee(data ?? null)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat data pegawai. Silakan coba lagi.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [nip])

  return { employee, isLoading, error, notFound: !isLoading && !error && !employee }
}
