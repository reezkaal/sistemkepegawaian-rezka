import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { EmployeeListItem } from '@/types/employee'

interface EmployeeTableProps {
  items: EmployeeListItem[]
  isLoading: boolean
  error: string | null
}

const COLUMN_COUNT = 7

/** Warna badge Status Kepegawaian - solid, tanpa gradient (lihat CLAUDE.md § 4). */
function statusTone(status: string): 'secondary' | 'success' {
  return status === 'PNS' ? 'secondary' : 'success'
}

function EmployeeRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[10rem] animate-pulse rounded bg-accent" />
        </td>
      ))}
    </tr>
  )
}

export default function EmployeeTable({ items, isLoading, error }: EmployeeTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="px-4 py-3">
              Nama
            </th>
            <th scope="col" className="px-4 py-3">
              NIP
            </th>
            <th scope="col" className="px-4 py-3">
              Jabatan
            </th>
            <th scope="col" className="px-4 py-3">
              Golongan
            </th>
            <th scope="col" className="px-4 py-3">
              Satker
            </th>
            <th scope="col" className="px-4 py-3">
              Status Kepegawaian
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <EmployeeRowSkeleton key={i} />)}

          {!isLoading && error && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-8 text-center text-sm text-destructive" role="alert">
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && items.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="h-8 w-8" aria-hidden="true" />
                  <p className="text-sm">Data pegawai tidak ditemukan.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            items.map((employee) => (
              <tr
                key={employee.nip}
                className="transition-colors odd:bg-card even:bg-muted/40 hover:bg-primary-soft/50"
              >
                <td className="px-4 py-3 font-medium text-foreground">{employee.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.nip}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.jabatan ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.golongan ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.satker || '-'}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(employee.statusKepegawaian)}>
                    {employee.statusKepegawaian || '-'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/pegawai/${employee.nip}`)}
                  >
                    Lihat Detail
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
