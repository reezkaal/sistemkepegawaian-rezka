import { useState } from 'react'
import { Users, ShieldCheck, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import EmployeeFilters from '@/components/employee/EmployeeFilters'
import EmployeeTable from '@/components/employee/EmployeeTable'
import EmployeePagination from '@/components/employee/EmployeePagination'
import { useEmployeeList } from '@/hooks/useEmployeeList'

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
    pageItems,
    totalResults,
    satkerOptions,
    bidangOptions,
    statusOptions,
    page,
    totalPages,
    setPage,
    summary,
  } = useEmployeeList(namaQuery, nipQuery, satkerFilter, bidangFilter, statusFilter)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Pegawai</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data pegawai berdasarkan Daftar Urut Kepangkatan (DUK). Halaman ini bersifat read-only.
        </p>
      </div>

      {/* Summary kecil: Total Pegawai, PNS, PPPK (brief redesign § 5) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryChip icon={Users} label="Total Pegawai" value={summary.total} tone="violet" />
        <SummaryChip icon={ShieldCheck} label="Pegawai PNS" value={summary.totalPNS} tone="primary" />
        <SummaryChip icon={Briefcase} label="Pegawai PPPK" value={summary.totalPPPK} tone="success" />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
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
        <EmployeeTable items={pageItems} isLoading={isLoading} error={error} />
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
