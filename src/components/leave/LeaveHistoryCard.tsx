import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { formatPeriode } from '@/lib/utils'
import type { LeaveHistoryEntry, StatusCuti } from '@/types/leave'

interface LeaveHistoryCardProps {
  entries: LeaveHistoryEntry[]
  isLoading: boolean
  error: string | null
}

const STATUS_TONE: Record<StatusCuti, BadgeTone> = {
  Disetujui: 'success',
  Diajukan: 'warning',
  Ditolak: 'destructive',
}

export default function LeaveHistoryCard({ entries, isLoading, error }: LeaveHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Cuti</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="space-y-3 p-4 sm:p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 w-full animate-pulse rounded bg-accent" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="p-4 text-sm text-destructive sm:p-6" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground sm:p-6">Belum terdapat riwayat cuti.</p>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 sm:px-6">
                    Periode
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jenis Cuti
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jumlah Hari
                  </th>
                  <th scope="col" className="px-4 py-3 sm:pr-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-foreground sm:px-6">
                      {formatPeriode(entry.tanggalMulai, entry.tanggalSelesai)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.jenisCuti}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.jumlahHari} hari</td>
                    <td className="px-4 py-3 sm:pr-6">
                      <Badge tone={STATUS_TONE[entry.status]}>{entry.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
