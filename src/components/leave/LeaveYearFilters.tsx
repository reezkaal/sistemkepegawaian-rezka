/**
 * CHECKPOINT A3 — Filter untuk halaman /cuti (Nilai Cuti Tahunan).
 *
 * Filter yang tersedia:
 * - Cari Nama
 * - Cari NIP
 * - Tahun (statis 2024–2033, sesuai DUK_Copy.xlsx)
 *
 * Tidak ada filter Jenis Cuti / Status karena data tersebut tidak
 * tersedia di sheet "NILAI CUTI TAHUNAN - AWAL TAHUN" DUK.
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TAHUN_OPTIONS } from '@/hooks/useLeaveTable'

interface LeaveYearFiltersProps {
  namaQuery: string
  onNamaQueryChange: (value: string) => void
  nipQuery: string
  onNipQueryChange: (value: string) => void
  tahunFilter: number
  onTahunFilterChange: (value: number) => void
}

export default function LeaveYearFilters({
  namaQuery,
  onNamaQueryChange,
  nipQuery,
  onNipQueryChange,
  tahunFilter,
  onTahunFilterChange,
}: LeaveYearFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label
          htmlFor="cuti-filter-nama"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Cari Nama
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="cuti-filter-nama"
            type="text"
            value={namaQuery}
            onChange={(e) => onNamaQueryChange(e.target.value)}
            placeholder="Cari berdasarkan nama..."
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cuti-filter-nip"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Cari NIP
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="cuti-filter-nip"
            type="text"
            value={nipQuery}
            onChange={(e) => onNipQueryChange(e.target.value)}
            placeholder="Cari berdasarkan NIP..."
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cuti-filter-tahun"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Tahun
        </label>
        <Select
          id="cuti-filter-tahun"
          value={String(tahunFilter)}
          onChange={(e) => onTahunFilterChange(Number(e.target.value))}
        >
          {TAHUN_OPTIONS.map((tahun) => (
            <option key={tahun} value={String(tahun)}>
              {tahun}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
