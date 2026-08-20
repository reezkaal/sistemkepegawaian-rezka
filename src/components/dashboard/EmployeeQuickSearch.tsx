import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch'

export default function EmployeeQuickSearch() {
  const [query, setQuery] = useState('')
  const { results, isLoading, error } = useEmployeeSearch(query)
  const navigate = useNavigate()
  const keyword = query.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cari Pegawai</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau NIP pegawai..."
            aria-label="Cari nama atau NIP pegawai"
            className="pl-9"
          />
        </div>

        {!keyword && (
          <p className="text-sm text-muted-foreground">
            Ketik nama atau NIP untuk mulai mencari pegawai.
          </p>
        )}

        {keyword && isLoading && (
          <ul aria-label="Memuat hasil pencarian" className="space-y-2">
            {[1, 2].map((i) => (
              <li key={i} className="h-14 animate-pulse rounded-lg bg-accent" />
            ))}
          </ul>
        )}

        {keyword && !isLoading && error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {keyword && !isLoading && !error && results.length === 0 && (
          <p className="text-sm text-muted-foreground">Pegawai tidak ditemukan.</p>
        )}

        {keyword && !isLoading && !error && results.length > 0 && (
          <ul className="divide-y divide-border">
            {results.map((employee) => (
              <li
                key={employee.nip}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <User className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{employee.nama}</p>
                    <p className="text-xs text-muted-foreground">NIP: {employee.nip}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/pegawai/${employee.nip}`)}
                >
                  Lihat Detail
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
