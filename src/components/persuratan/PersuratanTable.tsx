import { useState } from 'react'
import { FileText, Eye, ChevronLeft, ChevronRight, Inbox, Send, InboxIcon } from 'lucide-react'
import type { NaskahItem } from '@/types/persuratan'
import { formatTanggal, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import PersuratanDetailModal from './PersuratanDetailModal'

interface Props {
  items: NaskahItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  totalResults: number
  onPageChange: (p: number) => void
  /** Nomor urut global baris pertama (untuk kolom No.) */
  startIndex: number
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-2 py-2 text-center"><div className="mx-auto h-4 w-5 animate-pulse rounded bg-accent" /></td>
          <td className="px-2.5 py-2"><div className="h-5 w-20 animate-pulse rounded-full bg-accent" /></td>
          <td className="px-2.5 py-2"><div className="h-4 w-24 animate-pulse rounded bg-accent" /></td>
          <td className="px-2 py-2 text-center"><div className="mx-auto h-4 w-8 animate-pulse rounded bg-accent" /></td>
          <td className="px-2.5 py-2"><div className="h-4 w-full animate-pulse rounded bg-accent" /></td>
          <td className="px-2 py-2"><div className="h-4 w-16 animate-pulse rounded bg-accent" /></td>
          <td className="px-2 py-2"><div className="h-4 w-16 animate-pulse rounded bg-accent" /></td>
          <td className="px-2.5 py-2"><div className="h-4 w-20 animate-pulse rounded bg-accent" /></td>
          <td className="px-2 py-2 text-center"><div className="mx-auto h-7 w-7 animate-pulse rounded-md bg-accent" /></td>
        </tr>
      ))}
    </>
  )
}

export default function PersuratanTable({
  items,
  isLoading,
  error,
  page,
  totalPages,
  totalResults,
  onPageChange,
  startIndex,
}: Props) {
  const [selectedItem, setSelectedItem] = useState<NaskahItem | null>(null)
  const [activeRowNoUrut, setActiveRowNoUrut] = useState<number | null>(null)

  function handleRowClick(item: NaskahItem) {
    setActiveRowNoUrut(item.noUrut)
    setSelectedItem(item)
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        {/* table-fixed 100% dengan alokasi persentase presisi total 100% */}
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-xs lg:min-w-full">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="w-[4%] px-2 py-3 text-center">
                No.
              </th>
              <th scope="col" className="w-[13%] px-2.5 py-3">
                Kelompok
              </th>
              <th scope="col" className="w-[15%] px-2.5 py-3">
                Jenis Naskah
              </th>
              <th scope="col" className="w-[6%] px-2 py-3 text-center">
                Sifat
              </th>
              <th scope="col" className="w-[23%] px-2.5 py-3">
                Uraian Informasi
              </th>
              <th scope="col" className="w-[9%] px-2 py-3 whitespace-nowrap">
                Tgl Diterima
              </th>
              <th scope="col" className="w-[9%] px-2 py-3 whitespace-nowrap">
                Tgl Naskah
              </th>
              <th scope="col" className="w-[13%] px-2.5 py-3">
                Konseptor / OPR
              </th>
              <th scope="col" className="w-[8%] px-2 py-3 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <TableSkeleton />}

            {!isLoading && error && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-destructive">
                    <p className="text-sm font-semibold">Gagal memuat data persuratan</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <InboxIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Tidak ada naskah ditemukan</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Tidak ada data yang cocok dengan kriteria pencarian atau filter yang dipilih.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              items.map((item, idx) => {
                const isMasuk = item.kelompokNaskah === 'Naskah Masuk'
                const isSelected = activeRowNoUrut === item.noUrut

                return (
                  <tr
                    key={item.noUrut}
                    onClick={() => handleRowClick(item)}
                    className={cn(
                      'group cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-primary-soft/70 ring-1 ring-inset ring-primary/30'
                        : 'odd:bg-card even:bg-muted/20 hover:bg-primary-soft/30',
                    )}
                  >
                    {/* No. (4%) */}
                    <td className="px-2 py-2 text-center text-xs text-muted-foreground tabular-nums">
                      {startIndex + idx + 1}
                    </td>

                    {/* Kelompok (13%) */}
                    <td className="px-2.5 py-2 whitespace-nowrap">
                      <Badge
                        tone={isMasuk ? 'success' : 'secondary'}
                        className="truncate max-w-full px-2 py-0.5 text-[10.5px] font-medium"
                        title={item.kelompokNaskah}
                      >
                        {isMasuk ? (
                          <Inbox className="h-3 w-3 shrink-0" aria-hidden="true" />
                        ) : (
                          <Send className="h-3 w-3 shrink-0" aria-hidden="true" />
                        )}
                        <span className="truncate">{item.kelompokNaskah || '-'}</span>
                      </Badge>
                    </td>

                    {/* Jenis Naskah (15%) */}
                    <td className="px-2.5 py-2">
                      <div className="flex items-center gap-1.5 min-w-0" title={item.jenisNaskah}>
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                        <span className="truncate font-medium text-foreground">
                          {item.jenisNaskah || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Sifat (6%) */}
                    <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                      {item.sifatNaskah || 'Biasa'}
                    </td>

                    {/* Uraian Informasi (23% - line-clamp-2 dengan tooltip lengkap) */}
                    <td className="px-2.5 py-2">
                      <p
                        className="line-clamp-2 text-xs leading-relaxed text-foreground/90 group-hover:text-foreground"
                        title={item.uraianInformasi}
                      >
                        {item.uraianInformasi || '-'}
                      </p>
                    </td>

                    {/* Tgl Diterima (9%) */}
                    <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {item.tanggalDiterima ? formatTanggal(item.tanggalDiterima) : '-'}
                    </td>

                    {/* Tgl Naskah (9%) */}
                    <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {item.tanggalNaskah ? formatTanggal(item.tanggalNaskah) : '-'}
                    </td>

                    {/* Konseptor / OPR (13%) */}
                    <td className="px-2.5 py-2 text-xs text-muted-foreground">
                      <span className="truncate block" title={item.konseptorOpr ?? undefined}>
                        {item.konseptorOpr || '-'}
                      </span>
                    </td>

                    {/* Aksi (8% - Tombol icon-only Eye compact) */}
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <button
                        type="button"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(item)
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-background/60 text-muted-foreground transition-all duration-150 hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Menampilkan{' '}
          <span className="font-semibold text-foreground">
            {totalResults === 0 ? 0 : startIndex + 1}
          </span>
          –
          <span className="font-semibold text-foreground">
            {Math.min(startIndex + items.length, totalResults)}
          </span>{' '}
          dari <span className="font-semibold text-foreground">{totalResults}</span> naskah
        </p>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="px-2 text-xs font-medium text-muted-foreground">
            Halaman <span className="font-semibold text-foreground">{page}</span> dari {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Halaman berikutnya"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {selectedItem && (
        <PersuratanDetailModal
          item={selectedItem}
          open={true}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
