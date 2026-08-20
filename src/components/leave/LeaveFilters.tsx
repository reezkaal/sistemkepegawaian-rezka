import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { StatusCutiFilter, TahunFilter } from '@/hooks/useLeaveList'

interface LeaveFiltersProps {
  namaQuery: string
  onNamaQueryChange: (value: string) => void
  nipQuery: string
  onNipQueryChange: (value: string) => void
  jenisCutiFilter: string
  onJenisCutiFilterChange: (value: string) => void
  jenisCutiOptions: string[]
  statusFilter: StatusCutiFilter
  onStatusFilterChange: (value: StatusCutiFilter) => void
  tahunFilter: TahunFilter
  onTahunFilterChange: (value: TahunFilter) => void
  tahunOptions: number[]
}

export default function LeaveFilters({
  namaQuery,
  onNamaQueryChange,
  nipQuery,
  onNipQueryChange,
  jenisCutiFilter,
  onJenisCutiFilterChange,
  jenisCutiOptions,
  statusFilter,
  onStatusFilterChange,
  tahunFilter,
  onTahunFilterChange,
  tahunOptions,
}: LeaveFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label htmlFor="cuti-filter-nama" className="mb-1.5 block text-xs font-medium text-muted-foreground">
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
        <label htmlFor="cuti-filter-nip" className="mb-1.5 block text-xs font-medium text-muted-foreground">
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
        <label htmlFor="cuti-filter-jenis" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Jenis Cuti
        </label>
        <Select
          id="cuti-filter-jenis"
          value={jenisCutiFilter}
          onChange={(e) => onJenisCutiFilterChange(e.target.value)}
        >
          <option value="">Semua Jenis Cuti</option>
          {jenisCutiOptions.map((jenis) => (
            <option key={jenis} value={jenis}>
              {jenis}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="cuti-filter-status" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select
          id="cuti-filter-status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusCutiFilter)}
        >
          <option value="semua">Semua Status</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Diajukan">Diajukan</option>
          <option value="Ditolak">Ditolak</option>
        </Select>
      </div>

      <div>
        <label htmlFor="cuti-filter-tahun" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Tahun
        </label>
        <Select
          id="cuti-filter-tahun"
          value={String(tahunFilter)}
          onChange={(e) =>
            onTahunFilterChange(e.target.value === 'semua' ? 'semua' : Number(e.target.value))
          }
        >
          <option value="semua">Semua Tahun</option>
          {tahunOptions.map((tahun) => (
            <option key={tahun} value={String(tahun)}>
              {tahun}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
