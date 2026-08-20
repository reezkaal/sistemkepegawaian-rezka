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

import { Info } from 'lucide-react'
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
          {data ? `Data Nilai Cuti Tahunan ${data.tahun} (N-2/N-1/N)` : 'Data Nilai Cuti Tahunan'}
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
            <p className="mt-3 text-xs text-muted-foreground">
              Dijumlahkan dari {data.jumlahPegawaiTercatat} pegawai yang memiliki data untuk
              tahun {data.tahun}.
            </p>
            <div className="mt-3 flex gap-2 rounded-lg bg-muted p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">
                Angka di atas adalah nilai mentah N-2/N-1/N sebagaimana tercatat, dijumlahkan
                lintas pegawai. Ini <strong>bukan</strong> saldo atau sisa cuti yang dapat
                digunakan — arti bisnis N-2/N-1/N masih menunggu konfirmasi (lihat
                docs/data-mapping.md).
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
