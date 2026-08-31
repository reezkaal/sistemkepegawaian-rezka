/**
 * CutiSummaryCard — Ringkasan Cuti (Dashboard, Checkpoint 3D).
 *
 * Menampilkan agregat N-2/N-1/N (sheet "NILAI CUTI TAHUNAN") untuk
 * tahun berjalan, dijumlahkan lintas pegawai yang memiliki data.
 *
 * PENTING: TIDAK mengklaim N-2+N-1+N sebagai "saldo cuti yang dapat
 * digunakan" — arti bisnis N-2/N-1/N masih BELUM DIKONFIRMASI (lihat
 * docs/data-mapping.md § 2 & § 4). Pola tampilan & disclaimer konsisten
 * dengan `LeaveSummaryCard` yang sudah dipakai di Detail Pegawai.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { LeaveYearAggregate } from '@/types/dashboard'

interface CutiSummaryCardProps {
  data: LeaveYearAggregate | null
  isLoading: boolean
  error: string | null
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-primary-soft/40 px-4 py-3.5 transition-colors hover:bg-primary-soft">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
        {value.toLocaleString('id-ID')} <span className="text-sm font-medium text-muted-foreground">hari</span>
      </p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[4.5rem] animate-pulse rounded-lg bg-accent" />
      ))}
    </div>
  )
}

export default function CutiSummaryCard({ data, isLoading, error }: CutiSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Ringkasan Cuti</CardTitle>
        <CardDescription className="text-xs">
          {data
            ? `${data.jumlahPegawaiTercatat} dari ${data.tahun} pegawai punya data`
            : 'Data Nilai Cuti Tahunan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : !data || data.jumlahPegawaiTercatat === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada data Nilai Cuti Tahunan untuk tahun berjalan.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatBlock label={`N-2 (${data.tahun - 2})`} value={data.totalNMinus2} />
              <StatBlock label={`N-1 (${data.tahun - 1})`} value={data.totalNMinus1} />
              <StatBlock label={`N (${data.tahun})`} value={data.totalN} />
            </div>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Nilai mentah N-2/N-1/N sebagaimana tercatat — bukan saldo atau sisa cuti
              (arti bisnis belum dikonfirmasi, lihat docs/data-mapping.md).
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
