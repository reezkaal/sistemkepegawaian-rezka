import { Search, Filter, X } from 'lucide-react'

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

const inputCls =
  'h-9 w-full rounded-lg border border-input bg-background/70 px-3 text-sm text-foreground ' +
  'placeholder:text-muted-foreground/50 hover:border-border hover:bg-background ' +
  'focus:border-primary/50 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'transition-all duration-200'

const selectCls =
  'h-9 w-full rounded-lg border border-input bg-background/70 px-3 text-sm text-foreground ' +
  'hover:border-border hover:bg-background focus:border-primary/50 focus:bg-background ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'transition-all duration-200 cursor-pointer'

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

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
  const activeFilters = [namaQuery, nipQuery, statusFilter, satkerFilter, bidangFilter].filter(Boolean)
  const activeCount = activeFilters.length

  function handleReset() {
    onNamaQueryChange('')
    onNipQueryChange('')
    onStatusFilterChange('')
    onSatkerFilterChange('')
    onBidangFilterChange('')
  }

  return (
    <div className="space-y-4">
      {/* Header bar compact persis Persuratan */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Filter &amp; Pencarian
          </span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
              {activeCount} aktif
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Baris 1: 2 Kolom Pencarian (Cari Nama & Cari NIP) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="filter-nama" className={labelCls}>
            Cari Nama
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              id="filter-nama"
              type="search"
              value={namaQuery}
              onChange={(e) => onNamaQueryChange(e.target.value)}
              placeholder="Cari berdasarkan nama..."
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-nip" className={labelCls}>
            Cari NIP
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              id="filter-nip"
              type="search"
              value={nipQuery}
              onChange={(e) => onNipQueryChange(e.target.value)}
              placeholder="Cari berdasarkan NIP..."
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>
      </div>

      {/* Baris 2: 3 Kolom Dropdown Filter (Status, Satker, Bidang/Bagian) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="filter-status" className={labelCls}>
            Status Kepegawaian
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Semua Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-satker" className={labelCls}>
            Satker
          </label>
          <select
            id="filter-satker"
            value={satkerFilter}
            onChange={(e) => onSatkerFilterChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Semua Satker</option>
            {satkerOptions.map((satker) => (
              <option key={satker} value={satker}>
                {satker}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-bidang" className={labelCls}>
            Bidang / Bagian
          </label>
          <select
            id="filter-bidang"
            value={bidangFilter}
            onChange={(e) => onBidangFilterChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Semua Bidang/Bagian</option>
            {bidangOptions.map((bidang) => (
              <option key={bidang} value={bidang}>
                {bidang}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
