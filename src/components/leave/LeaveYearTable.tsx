/**
 * CHECKPOINT A3 — Tabel Nilai Cuti Tahunan (N-2/N-1/N).
 *
 * Menampilkan kolom: Nama Pegawai, NIP, N-2, N-1, N untuk tahun yang dipilih.
 * Nilai undefined/null ditampilkan sebagai "—" (bukan angka karangan).
 *
 * TIDAK menampilkan: Jenis Cuti, Periode, Jumlah Hari, Status pengajuan —
 * karena data tersebut tidak tersedia di sheet "NILAI CUTI TAHUNAN" DUK.
 */

import { CalendarOff, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { LeaveTableRow, NamaSortDirection } from '@/hooks/useLeaveTable'

interface LeaveYearTableProps {
  items: LeaveTableRow[]
  tahun: number
  isLoading: boolean
  error: string | null
  /** Arah sorting kolom Nama Pegawai saat ini (`null` = urutan default/asli). */
  namaSortDirection: NamaSortDirection
  /** Toggle sorting Nama: klik 1=A-Z, klik 2=Z-A, klik 3=kembali ke default. */
  onToggleNamaSort: () => void
}

/** Indikator arah sorting kolom Nama: default=↕, A-Z=↑, Z-A=↓. */
function NamaSortIcon({ direction }: { direction: NamaSortDirection }) {
  if (direction === 'asc') return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  if (direction === 'desc') return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
}

const COLUMN_COUNT = 5

function RowSkeleton() {
  return (
    <tr>
      {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-accent" />
        </td>
      ))}
    </tr>
  )
}

/** Nilai kosong -> "—" (bukan "-") + unit "hari" agar mudah dibaca pengguna awam. */
function fmtVal(v: number | undefined): string {
  return v === undefined ? '—' : `${v} hari`
}

export default function LeaveYearTable({
  items,
  tahun,
  isLoading,
  error,
  namaSortDirection,
  onToggleNamaSort,
}: LeaveYearTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="px-4 py-3">
              <button
                type="button"
                onClick={onToggleNamaSort}
                className={`flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground ${
                  namaSortDirection ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-label={`Urutkan berdasarkan Nama Pegawai ${namaSortDirection === 'asc' ? '(A-Z, klik untuk Z-A)' : namaSortDirection === 'desc' ? '(Z-A, klik untuk urutan default)' : '(urutan default, klik untuk A-Z)'}`}
              >
                Nama Pegawai
                <NamaSortIcon direction={namaSortDirection} />
              </button>
            </th>
            <th scope="col" className="px-4 py-3">
              NIP
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              {tahun - 2} <span className="normal-case text-muted-foreground/70">(N-2)</span>
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              {tahun - 1} <span className="normal-case text-muted-foreground/70">(N-1)</span>
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              {tahun} <span className="normal-case text-muted-foreground/70">(N)</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}

          {!isLoading && error && (
            <tr>
              <td
                colSpan={COLUMN_COUNT}
                className="px-4 py-8 text-center text-sm text-destructive"
                role="alert"
              >
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && items.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CalendarOff className="h-8 w-8" aria-hidden="true" />
                  <p className="text-sm">Data tidak ditemukan.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            items.map((row) => (
              <tr
                // NIP kosong pada ~99% data DUK asli (lihat audit sorting bug) —
                // key lama `${nip}-${tahun}` collide besar-besaran saat NIP
                // kosong (tahun tetap sama untuk semua baris di satu halaman),
                // sehingga React salah mencocokkan/duplikasi baris saat urutan
                // berubah (sorting Nama A-Z/Z-A/default). Nama unik di seluruh
                // data DUK, jadi digabung sebagai bagian key yang membedakan.
                key={`${row.nip || 'no-nip'}-${row.nama}-${row.tahun}`}
                className="transition-colors odd:bg-card even:bg-muted/40 hover:bg-primary-soft/50"
              >
                <td className="px-4 py-3 font-medium text-foreground">{row.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.nip}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {fmtVal(row.nMinus2)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {fmtVal(row.nMinus1)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {fmtVal(row.n)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
