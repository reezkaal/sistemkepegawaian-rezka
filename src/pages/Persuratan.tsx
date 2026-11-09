/**
 * Halaman Persuratan (/persuratan)
 *
 * Menampilkan daftar naskah masuk/keluar PPSDMPU dari spreadsheet
 * "naskahmsk-klr".
 */

import { RotateCw, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PersuratanSummaryCards from '@/components/persuratan/PersuratanSummaryCards'
import PersuratanFilters from '@/components/persuratan/PersuratanFilters'
import PersuratanTable from '@/components/persuratan/PersuratanTable'
import { usePersuratan } from '@/hooks/usePersuratan'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 15

export default function Persuratan() {
  const {
    isLoading,
    dataSourceStatus,
    error,
    lastUpdated,
    refetch,
    pageItems,
    totalResults,
    page,
    totalPages,
    setPage,
    filter,
    setFilter,
    resetFilter,
    summary,
    kelompokOptions,
    jenisOptions,
  } = usePersuratan()

  const startIndex = (page - 1) * PAGE_SIZE

  // Format jam pembaruan terakhir (HH:mm:ss)
  const formattedLastUpdated = lastUpdated
    ? new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(lastUpdated)
    : null

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Persuratan</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Pengelolaan dan rekapitulasi naskah dinas masuk &amp; keluar PPSDMPU.
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
            aria-label="Segarkan data persuratan"
          >
            <RotateCw className={cn('h-3.5 w-3.5 text-muted-foreground', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Status Banner jika belum terhubung */}
      {dataSourceStatus !== 'connected' && (
        <div className="flex gap-2.5 rounded-xl border border-border bg-primary-soft/40 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">
              {dataSourceStatus === 'error'
                ? 'Gagal terhubung ke sumber data persuratan.'
                : 'Sumber data eksternal belum terhubung.'}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Hubungkan endpoint Google Apps Script di{' '}
              <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">src/services/persuratan.ts</code>{' '}
              untuk sinkronisasi otomatis.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <PersuratanSummaryCards
        total={summary.total}
        masuk={summary.masuk}
        keluar={summary.keluar}
        tidakLengkap={summary.tidakLengkap}
        dataSourceStatus={dataSourceStatus}
      />

      {/* Filter & Pencarian */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <PersuratanFilters
            filter={filter}
            onChange={setFilter}
            onReset={resetFilter}
            kelompokOptions={kelompokOptions}
            jenisOptions={jenisOptions}
          />
        </CardContent>
      </Card>

      {/* Tabel Naskah */}
      <Card className="overflow-hidden p-0">
        <PersuratanTable
          items={pageItems}
          isLoading={isLoading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
          startIndex={startIndex}
        />
      </Card>
    </div>
  )
}
