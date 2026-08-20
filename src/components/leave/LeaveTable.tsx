import { CalendarOff } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { formatPeriode } from '@/lib/utils'
import type { LeaveHistoryEntry, StatusCuti } from '@/types/leave'

interface LeaveTableProps {
  items: LeaveHistoryEntry[]
  isLoading: boolean
  error: string | null
}

const COLUMN_COUNT = 6

const STATUS_TONE: Record<StatusCuti, BadgeTone> = {
  Disetujui: 'success',
  Diajukan: 'warning',
  Ditolak: 'destructive',
}

function LeaveRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[10rem] animate-pulse rounded bg-accent" />
        </td>
      ))}
    </tr>
  )
}

export default function LeaveTable({ items, isLoading, error }: LeaveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-3">
              Nama Pegawai
            </th>
            <th scope="col" className="px-4 py-3">
              NIP
            </th>
            <th scope="col" className="px-4 py-3">
              Jenis Cuti
            </th>
            <th scope="col" className="px-4 py-3">
              Periode
            </th>
            <th scope="col" className="px-4 py-3">
              Jumlah Hari
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <LeaveRowSkeleton key={i} />)}

          {!isLoading && error && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-8 text-center text-sm text-destructive" role="alert">
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && items.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CalendarOff className="h-8 w-8" aria-hidden="true" />
                  <p className="text-sm">Data cuti tidak ditemukan.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            items.map((entry) => (
              <tr key={entry.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{entry.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.nip}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.jenisCuti}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatPeriode(entry.tanggalMulai, entry.tanggalSelesai)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.jumlahHari} hari</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[entry.status]}>{entry.status}</Badge>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
