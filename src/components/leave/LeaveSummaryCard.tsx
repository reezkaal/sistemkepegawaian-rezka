import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LeaveRecord } from '@/types/leave'

interface LeaveSummaryCardProps {
  record: LeaveRecord | null
  isLoading: boolean
  error: string | null
  notFound: boolean
  tahunBerjalan: number
}

interface SummaryRowProps {
  label: string
  value: number | undefined
  emphasis?: boolean
}

function SummaryRow({ label, value, emphasis }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className={emphasis ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}>
        {label}
      </span>
      <span className={emphasis ? 'text-base font-semibold text-foreground' : 'text-sm text-foreground'}>
        {value === undefined ? '—' : `${value} hari`}
      </span>
    </div>
  )
}

export default function LeaveSummaryCard({
  record,
  isLoading,
  error,
  notFound,
  tahunBerjalan,
}: LeaveSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Cuti</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 w-full animate-pulse rounded bg-accent" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && notFound && (
          <p className="text-sm text-muted-foreground">
            Belum terdapat data ringkasan cuti untuk pegawai ini.
          </p>
        )}

        {!isLoading && !error && !notFound && record && (
          <LeaveSummaryBody record={record} tahunBerjalan={tahunBerjalan} />
        )}
      </CardContent>
    </Card>
  )
}

function LeaveSummaryBody({ record, tahunBerjalan }: { record: LeaveRecord; tahunBerjalan: number }) {
  const yearValue = record.nilaiTahunan.find((v) => v.tahun === tahunBerjalan)

  if (!yearValue) {
    return (
      <p className="text-sm text-muted-foreground">
        Data ringkasan cuti untuk tahun {tahunBerjalan} belum tersedia.
      </p>
    )
  }

  const { nMinus2, nMinus1, n } = yearValue
  const hasAnyValue = nMinus2 !== undefined || nMinus1 !== undefined || n !== undefined
  const total = (nMinus2 ?? 0) + (nMinus1 ?? 0) + (n ?? 0)

  return (
    <div>
      <dl className="divide-y divide-border">
        <SummaryRow label={`N-2 (${tahunBerjalan - 2})`} value={nMinus2} />
        <SummaryRow label={`N-1 (${tahunBerjalan - 1})`} value={nMinus1} />
        <SummaryRow label={`N (${tahunBerjalan})`} value={n} />
        <SummaryRow label="Total Cuti" value={hasAnyValue ? total : undefined} emphasis />
      </dl>
      <div className="mt-3 flex gap-2 rounded-lg bg-muted p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Total Cuti adalah penjumlahan otomatis dari N-2 + N-1 + N, bukan "Sisa Cuti" dan
          bukan saldo cuti yang otomatis dapat digunakan. Nilai N-2/N-1/N di atas adalah data
          mentah sebagaimana tercatat, dan arti bisnisnya masih menunggu konfirmasi (lihat
          docs/data-mapping.md).
        </p>
      </div>
    </div>
  )
}
