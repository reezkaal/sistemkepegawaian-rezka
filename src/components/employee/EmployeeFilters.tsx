import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface EmployeeFiltersProps {
  namaQuery: string
  onNamaQueryChange: (value: string) => void
  nipQuery: string
  onNipQueryChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  statusOptions: string[]
  satkerFilter: string
  onSatkerFilterChange: (value: string) => void
  satkerOptions: string[]
  bidangFilter: string
  onBidangFilterChange: (value: string) => void
  bidangOptions: string[]
}

function GroupHeading({ icon: Icon, title }: { icon: typeof Search; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
    </div>
  )
}

// Dikelompokkan menjadi "Pencarian" (nama/NIP) dan "Filter" (status/satker/
// bidang) — masing-masing dalam panel dengan latar berbeda dari background
// halaman, sesuai brief redesign § 5 ("jangan membuat semua input terlihat
// seperti satu area putih kosong").
export default function EmployeeFilters({
  namaQuery,
  onNamaQueryChange,
  nipQuery,
  onNipQueryChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  satkerFilter,
  onSatkerFilterChange,
  satkerOptions,
  bidangFilter,
  onBidangFilterChange,
  bidangOptions,
}: EmployeeFiltersProps) {
  return (
    <div className="space-y-4">
      {/* ── Pencarian ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/60 p-4">
        <GroupHeading icon={Search} title="Pencarian" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="filter-nama" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Cari Nama
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="filter-nama"
                type="text"
                value={namaQuery}
                onChange={(e) => onNamaQueryChange(e.target.value)}
                placeholder="Cari berdasarkan nama..."
                className="bg-card pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-nip" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Cari NIP
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="filter-nip"
                type="text"
                value={nipQuery}
                onChange={(e) => onNipQueryChange(e.target.value)}
                placeholder="Cari berdasarkan NIP..."
                className="bg-card pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/60 p-4">
        <GroupHeading icon={SlidersHorizontal} title="Filter" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-status" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Status Kepegawaian
            </label>
            <Select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-card"
            >
              <option value="">Semua Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="filter-satker" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Satker
            </label>
            <Select
              id="filter-satker"
              value={satkerFilter}
              onChange={(e) => onSatkerFilterChange(e.target.value)}
              className="bg-card"
            >
              <option value="">Semua Satker</option>
              {satkerOptions.map((satker) => (
                <option key={satker} value={satker}>
                  {satker}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="filter-bidang" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Bidang/Bagian
            </label>
            <Select
              id="filter-bidang"
              value={bidangFilter}
              onChange={(e) => onBidangFilterChange(e.target.value)}
              className="bg-card"
            >
              <option value="">Semua Bidang/Bagian</option>
              {bidangOptions.map((bidang) => (
                <option key={bidang} value={bidang}>
                  {bidang}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
