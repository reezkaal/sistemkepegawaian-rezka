import { useState } from 'react'
import { Users, ShieldCheck, Briefcase, RotateCw, AlertCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import EmployeeFilters from '@/components/employee/EmployeeFilters'
import EmployeeTable from '@/components/employee/EmployeeTable'
import EmployeePagination from '@/components/employee/EmployeePagination'
import { useEmployeeList } from '@/hooks/useEmployeeList'
import { cn } from '@/lib/utils'

function SummaryChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: number
  tone: 'violet' | 'primary' | 'success'
}) {
  const toneStyles = {
    violet: 'bg-violet/10 text-violet',
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success/10 text-success',
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneStyles}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-foreground">{value.toLocaleString('id-ID')}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function Employees() {
  const [namaQuery, setNamaQuery] = useState('')
  const [nipQuery, setNipQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [satkerFilter, setSatkerFilter] = useState('')
  const [bidangFilter, setBidangFilter] = useState('')

  const {
    isLoading,
    error,
    refreshError,
    clearRefreshError,
    lastUpdated,
    refetch,
    pageItems,
    totalResults,
    satkerOptions,
    bidangOptions,
    statusOptions,
    page,
    totalPages,
    setPage,
    summary,
    namaSortDirection,
    onToggleNamaSort,
  } = useEmployeeList(namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter)

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Pegawai</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data pegawai berdasarkan Daftar Urut Kepangkatan (DUK). Halaman ini bersifat read-only.
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
            aria-label="Segarkan data pegawai"
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

      {/* Summary kecil: Total Pegawai, PNS, PPPK (brief redesign § 5) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryChip icon={Users} label="Total Pegawai" value={summary.total} tone="violet" />
        <SummaryChip icon={ShieldCheck} label="Pegawai PNS" value={summary.totalPNS} tone="primary" />
        <SummaryChip icon={Briefcase} label="Pegawai PPPK" value={summary.totalPPPK} tone="success" />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <EmployeeFilters
            namaQuery={namaQuery}
            onNamaQueryChange={setNamaQuery}
            nipQuery={nipQuery}
            onNipQueryChange={setNipQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
            satkerFilter={satkerFilter}
            onSatkerFilterChange={setSatkerFilter}
            satkerOptions={satkerOptions}
            bidangFilter={bidangFilter}
            onBidangFilterChange={setBidangFilter}
            bidangOptions={bidangOptions}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <EmployeeTable
          items={pageItems}
          isLoading={isLoading}
          error={error}
          namaSortDirection={namaSortDirection}
          onToggleNamaSort={onToggleNamaSort}
        />
        <EmployeePagination
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}
