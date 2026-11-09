import { Search, X, Filter } from 'lucide-react'
import type { PersuratanFilter } from '@/types/persuratan'

interface Props {
  filter: PersuratanFilter
  onChange: (f: PersuratanFilter) => void
  onReset: () => void
  kelompokOptions: string[]
  jenisOptions: string[]
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

export default function PersuratanFilters({
  filter,
  onChange,
  onReset,
  kelompokOptions,
  jenisOptions,
}: Props) {
  function set(key: keyof PersuratanFilter, value: string) {
    onChange({ ...filter, [key]: value })
  }

  const activeFilterCount = Object.values(filter).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Baris judul filter ringkas dengan status aktif */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Filter &amp; Pencarian
          </span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
              {activeFilterCount} aktif
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Grid 4 Kolom Simetris */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Baris 1: Uraian Informasi (2 kolom) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <label htmlFor="f-uraian" className={labelCls}>
            Uraian Informasi
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              id="f-uraian"
              type="search"
              placeholder="Cari perihal atau uraian naskah..."
              value={filter.searchUraian}
              onChange={(e) => set('searchUraian', e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>

        {/* Baris 1: Konseptor / OPR (1 kolom) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <label htmlFor="f-konseptor" className={labelCls}>
            Konseptor / OPR
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              id="f-konseptor"
              type="search"
              placeholder="Cari konseptor/unit..."
              value={filter.searchKonseptor}
              onChange={(e) => set('searchKonseptor', e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>

        {/* Baris 1: Kelompok Naskah (1 kolom) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <label htmlFor="f-kelompok" className={labelCls}>
            Kelompok Naskah
          </label>
          <select
            id="f-kelompok"
            value={filter.kelompokNaskah}
            onChange={(e) => set('kelompokNaskah', e.target.value)}
            className={selectCls}
          >
            <option value="">Semua Kelompok</option>
            {kelompokOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Baris 2: Jenis Naskah Dropdown (2 kolom) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <label htmlFor="f-jenis" className={labelCls}>
            Jenis Naskah
          </label>
          <select
            id="f-jenis"
            value={filter.jenisNaskah}
            onChange={(e) => set('jenisNaskah', e.target.value)}
            className={selectCls}
          >
            <option value="">Semua Jenis Naskah</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Baris 2: Tanggal Dari (1 kolom) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <label htmlFor="f-tgl-mulai" className={labelCls}>
            Tanggal Dari
          </label>
          <input
            id="f-tgl-mulai"
            type="date"
            value={filter.tanggalMulai}
            onChange={(e) => set('tanggalMulai', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Baris 2: Tanggal Sampai (1 kolom) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <label htmlFor="f-tgl-selesai" className={labelCls}>
            Tanggal Sampai
          </label>
          <input
            id="f-tgl-selesai"
            type="date"
            value={filter.tanggalSelesai}
            onChange={(e) => set('tanggalSelesai', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  )
}
