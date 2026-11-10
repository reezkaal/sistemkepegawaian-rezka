/**
 * CHECKPOINT A3 — Halaman Nilai Cuti Tahunan (/cuti).
 *
 * Menampilkan data Nilai Cuti Tahunan (N-2/N-1/N) dari sheet
 * "NILAI CUTI TAHUNAN - AWAL TAHUN" di DUK_Copy.xlsx.
 *
 * Filter: Cari Nama, Cari NIP, Tahun (2024–2033).
 * Tidak ada filter Jenis Cuti / Status / Periode karena data tersebut
 * tidak tersedia di sheet DUK yang digunakan (lihat docs/data-mapping.md).
 *
 * Arti bisnis N-2/N-1/N masih BELUM DIKONFIRMASI — ditampilkan sebagai
 * nilai mentah apa adanya dari DUK, tanpa label "Sisa Cuti".
 */

import { useState } from 'react'
import { Info, RotateCw, AlertCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LeaveYearFilters from '@/components/leave/LeaveYearFilters'
import LeaveYearTable from '@/components/leave/LeaveYearTable'
import LeavePagination from '@/components/leave/LeavePagination'
import { useLeaveTable, TAHUN_OPTIONS } from '@/hooks/useLeaveTable'
import { cn } from '@/lib/utils'

export default function Leave() {
  const [namaQuery, setNamaQuery] = useState('')
  const [nipQuery, setNipQuery] = useState('')
  // Default tahun: tahun pertama yang ada datanya di DUK (2024)
  const [tahunFilter, setTahunFilter] = useState<number>(TAHUN_OPTIONS[0])

  const {
    isLoading,
    error,
    refreshError,
    clearRefreshError,
    lastUpdated,
    refetch,
    pageItems,
    totalResults,
    page,
    totalPages,
    setPage,
    namaSortDirection,
    onToggleNamaSort,
  } = useLeaveTable(namaQuery, nipQuery, tahunFilter)

  // Format jam pembaruan terakhir (HH:mm:ss WIB)
  const formattedLastUpdated = lastUpdated
    ? new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(lastUpdated)
    : null

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nilai Cuti Tahunan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data N-2/N-1/N per pegawai berdasarkan sheet "Nilai Cuti Tahunan - Awal Tahun". Halaman ini bersifat read-only.
          </p>
        </div>

        {/* Action Toolbar Header */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          {isLoading ? (
            <span className="hidden text-xs text-muted-foreground/80 sm:inline-block">
              Memperbarui data...
            </span>
          ) : formattedLastUpdated ? (
            <span className="hidden text-xs text-muted-foreground/80 sm:inline-block">
              Terakhir diperbarui: <span className="font-medium text-foreground">{formattedLastUpdated}</span>
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-secondary hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Segarkan data cuti"
          >
            <RotateCw className={cn('h-3.5 w-3.5 text-muted-foreground', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Error alert saat refresh gagal */}
      {refreshError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{refreshError}</span>
          </div>
          <button
            type="button"
            onClick={clearRefreshError}
            className="rounded p-1 text-destructive/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
            aria-label="Tutup notifikasi error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Catatan konteks data */}
      <div className="flex gap-2 rounded-lg border border-border bg-primary-soft/40 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Nilai N-2, N-1, dan N di bawah adalah data mentah sebagaimana tercatat di DUK.
          Arti bisnis ketiga nilai tersebut masih menunggu konfirmasi dan belum ditentukan
          apakah ini saldo, jatah, atau data lain (lihat docs/data-mapping.md).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pencarian &amp; Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveYearFilters
            namaQuery={namaQuery}
            onNamaQueryChange={setNamaQuery}
            nipQuery={nipQuery}
            onNipQueryChange={setNipQuery}
            tahunFilter={tahunFilter}
            onTahunFilterChange={setTahunFilter}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <LeaveYearTable
          items={pageItems}
          tahun={tahunFilter}
          isLoading={isLoading}
          error={error}
          namaSortDirection={namaSortDirection}
          onToggleNamaSort={onToggleNamaSort}
        />
        <LeavePagination
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}
