import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowUp, ArrowDown, ArrowUpDown, ArrowRight, LayoutGrid, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EmployeeListItem } from '@/types/employee'
import type { NamaSortDirection } from '@/hooks/useEmployeeList'

interface EmployeeTableProps {
  items: EmployeeListItem[]
  isLoading: boolean
  error: string | null
  /** Arah sorting kolom Nama saat ini (`null` = urutan default/asli). */
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

const COLUMN_COUNT = 7

function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function avatarTone(status: string): string {
  if (status === 'PNS') return 'bg-primary/15 text-primary ring-1 ring-primary/20'
  if (status === 'PPPK') return 'bg-success/15 text-success ring-1 ring-success/20'
  return 'bg-amber/15 text-amber ring-1 ring-amber/20'
}

function displayStatus(status: string): string {
  return status && status !== '-' ? status : 'OS'
}

function formatAktifLabel(employee: EmployeeListItem): string | null {
  if (typeof employee.aktifBulanCount !== 'number') return null
  if (
    employee.aktifBulanCount > 0 &&
    (employee.aktifPeriode || (employee.aktifMulai && employee.aktifSampai))
  ) {
    return `${employee.aktifBulanCount} bln · ${employee.aktifPeriode ?? `${employee.aktifMulai} – ${employee.aktifSampai}`}`
  }
  return `${employee.aktifBulanCount} bln`
}

/** Warna badge Status Kepegawaian - solid, tanpa gradient (lihat CLAUDE.md § 4). */
function statusTone(status: string): 'secondary' | 'success' | 'warning' {
  if (status === 'PNS') return 'secondary'
  if (status === 'PPPK') return 'success'
  return 'warning'
}

function EmployeeRowSkeleton() {
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

export default function EmployeeTable({
  items,
  isLoading,
  error,
  namaSortDirection,
  onToggleNamaSort,
}: EmployeeTableProps) {
  const navigate = useNavigate()
  const [mobileView, setMobileView] = useState<'card' | 'table'>('card')

  return (
    <>
      {/* Toolbar Pilihan Mode Tampilan di HP (< 768px) */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-2.5 md:hidden">
        <div
          className="inline-flex rounded-lg border border-border bg-background/70 p-0.5"
          role="group"
          aria-label="Pilih mode tampilan daftar pegawai"
        >
          <button
            type="button"
            onClick={() => setMobileView('card')}
            aria-pressed={mobileView === 'card'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
              mobileView === 'card'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            Kartu
          </button>
          <button
            type="button"
            onClick={() => setMobileView('table')}
            aria-pressed={mobileView === 'table'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
              mobileView === 'table'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
            Tabel
          </button>
        </div>

        {mobileView === 'card' && (
          <button
            type="button"
            onClick={onToggleNamaSort}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <span>Urutkan</span>
            <NamaSortIcon direction={namaSortDirection} />
          </button>
        )}
      </div>

      {/* Mode Kartu untuk layar HP (< 768px) */}
      {mobileView === 'card' && (
      <div className="md:hidden">

        {isLoading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-xl bg-accent" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-40 animate-pulse rounded bg-accent" />
                    <div className="h-3 w-28 animate-pulse rounded bg-accent" />
                  </div>
                </div>
                <div className="h-3 w-48 animate-pulse rounded bg-accent" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="px-4 py-8 text-center text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
            <Users className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">Data pegawai tidak ditemukan.</p>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="divide-y divide-border">
            {items.map((employee) => {
              const aktifLabel = formatAktifLabel(employee)
              return (
                <div
                  key={`${employee.nip || 'no-nip'}-${employee.nama}`}
                  className="space-y-3 p-4 transition-colors hover:bg-primary-soft/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${avatarTone(employee.statusKepegawaian)}`}
                        aria-hidden="true"
                      >
                        {getInitials(employee.nama)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{employee.nama}</p>
                        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                          {employee.nip || 'NIP belum tercatat'}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone(employee.statusKepegawaian)} className="shrink-0">
                      {displayStatus(employee.statusKepegawaian)}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="line-clamp-1 font-medium text-foreground/85">
                      {employee.jabatan ?? '-'}
                    </p>
                    <p className="mt-0.5 line-clamp-1">
                      {[employee.golongan, employee.satker].filter(Boolean).join(' · ') || '-'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Badge tone={employee.statusAktif ? 'success' : 'muted'}>
                        {employee.statusAktif ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                      {aktifLabel && (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {aktifLabel}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => navigate(`/pegawai/${employee.nip}`)}
                    >
                      Detail
                      <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      )}

      {/* Mode Tabel: selalu tampil di >= 768px, atau di HP saat memilih mode Tabel */}
      <div className={cn('overflow-x-auto', mobileView === 'card' ? 'hidden md:block' : 'block')}>
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="px-4 py-3">
              <button
                type="button"
                onClick={onToggleNamaSort}
                className={`flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground ${
                  namaSortDirection ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-label={`Urutkan berdasarkan Nama ${namaSortDirection === 'asc' ? '(A-Z, klik untuk Z-A)' : namaSortDirection === 'desc' ? '(Z-A, klik untuk urutan default)' : '(urutan default, klik untuk A-Z)'}`}
              >
                Pegawai
                <NamaSortIcon direction={namaSortDirection} />
              </button>
            </th>
            <th scope="col" className="px-4 py-3">
              Jabatan
            </th>
            <th scope="col" className="px-4 py-3">
              Golongan
            </th>
            <th scope="col" className="px-4 py-3">
              Satker
            </th>
            <th scope="col" className="px-4 py-3">
              Status Kepegawaian
            </th>
            <th scope="col" className="px-4 py-3">
              Status Aktif
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <EmployeeRowSkeleton key={i} />)}

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
                  <Users className="h-8 w-8" aria-hidden="true" />
                  <p className="text-sm">Data pegawai tidak ditemukan.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            items.map((employee) => (
              <tr
                // NIP kosong pada ~99% data DUK asli (lihat audit sorting bug) —
                // key HARUS unik per baris walau NIP kosong, jadi digabung
                // dengan Nama (unik di seluruh data DUK) supaya React tidak
                // salah mencocokkan/duplikasi baris saat urutan berubah
                // (sorting Nama A-Z/Z-A/default).
                key={`${employee.nip || 'no-nip'}-${employee.nama}`}
                className="transition-colors odd:bg-card even:bg-muted/40 hover:bg-primary-soft/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${avatarTone(employee.statusKepegawaian)}`}
                      aria-hidden="true"
                    >
                      {getInitials(employee.nama)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{employee.nama}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {employee.nip || 'NIP belum tercatat'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{employee.jabatan ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.golongan ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.satker || '-'}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(employee.statusKepegawaian)}>
                    {displayStatus(employee.statusKepegawaian)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <Badge tone={employee.statusAktif ? 'success' : 'muted'}>
                      {employee.statusAktif ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                    {formatAktifLabel(employee) && (
                      <span className="max-w-[230px] text-[11px] leading-snug text-muted-foreground">
                        {formatAktifLabel(employee)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/pegawai/${employee.nip}`)}
                  >
                    Detail
                    <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    </>
  )
}
