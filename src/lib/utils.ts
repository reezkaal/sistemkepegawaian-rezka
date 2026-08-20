import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TANGGAL_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** Format tanggal ISO (YYYY-MM-DD) menjadi format Indonesia singkat, mis. "2 Feb 2026". */
export function formatTanggal(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return TANGGAL_FORMATTER.format(date)
}

/** Format rentang tanggal mulai-selesai menjadi satu string periode. */
export function formatPeriode(tanggalMulai: string, tanggalSelesai: string): string {
  if (tanggalMulai === tanggalSelesai) return formatTanggal(tanggalMulai)
  return `${formatTanggal(tanggalMulai)} - ${formatTanggal(tanggalSelesai)}`
}
