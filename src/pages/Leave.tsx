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
import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LeaveYearFilters from '@/components/leave/LeaveYearFilters'
import LeaveYearTable from '@/components/leave/LeaveYearTable'
import LeavePagination from '@/components/leave/LeavePagination'
import { useLeaveTable, TAHUN_OPTIONS } from '@/hooks/useLeaveTable'

export default function Leave() {
  const [namaQuery, setNamaQuery] = useState('')
  const [nipQuery, setNipQuery] = useState('')
  // Default tahun: tahun pertama yang ada datanya di DUK (2024)
  const [tahunFilter, setTahunFilter] = useState<number>(TAHUN_OPTIONS[0])

  const {
    isLoading,
    error,
    pageItems,
    totalResults,
    page,
    totalPages,
    setPage,
    namaSortDirection,
    onToggleNamaSort,
  } = useLeaveTable(namaQuery, nipQuery, tahunFilter)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nilai Cuti Tahunan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data N-2/N-1/N per pegawai berdasarkan sheet "Nilai Cuti Tahunan - Awal Tahun".
          Halaman ini bersifat read-only.
        </p>
      </div>

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
