import { useEffect, useState } from 'react'
import { getDashboardSummary, getLeaveTypeSummary, getLeaveYearAggregate } from '@/services/api'
import type { DashboardSummary, LeaveTypeSummaryItem, LeaveYearAggregate } from '@/types/dashboard'

interface UseDashboardSummaryResult {
  summary: DashboardSummary | null
  leaveTypeData: LeaveTypeSummaryItem[]
  leaveYearSummary: LeaveYearAggregate | null
  isLoading: boolean
  error: string | null
}

// "Tahun N" mengikuti tahun berjalan saat ini, konsisten dengan
// LeaveYearTable/LeaveSummaryCard di halaman Cuti & Detail Pegawai.
const currentYear = new Date().getFullYear()

/**
 * Mengambil data ringkasan (stat cards), rekap cuti (contoh), dan
 * agregat N-2/N-1/N tahun berjalan untuk Dashboard. Mengikuti arsitektur
 * UI -> Hook -> Service -> Mock Data.
 */
export function useDashboardSummary(): UseDashboardSummaryResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [leaveTypeData, setLeaveTypeData] = useState<LeaveTypeSummaryItem[]>([])
  const [leaveYearSummary, setLeaveYearSummary] = useState<LeaveYearAggregate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError(null)

    Promise.all([
      getDashboardSummary(),
      getLeaveTypeSummary(),
      getLeaveYearAggregate(currentYear),
    ])
      .then(([summaryResult, leaveTypeResult, leaveYearResult]) => {
        if (!isActive) return
        setSummary(summaryResult)
        setLeaveTypeData(leaveTypeResult)
        setLeaveYearSummary(leaveYearResult)
      })
      .catch(() => {
        if (!isActive) return
        setError('Gagal memuat data ringkasan dashboard. Silakan muat ulang halaman.')
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return { summary, leaveTypeData, leaveYearSummary, isLoading, error }
}
