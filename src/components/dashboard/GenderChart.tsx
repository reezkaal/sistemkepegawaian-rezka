/**
 * Donut Chart — Distribusi Gender Pegawai (Laki-laki / Perempuan / Belum Terisi).
 * "(Belum Terisi)" = field jenisKelamin kosong di spreadsheet, BUKAN kategori gender.
 * Warna: Laki-laki=primary(biru), Perempuan=pink, Belum Terisi=muted.
 *
 * Legend dipisah keluar dari PieChart agar cy="50%" benar-benar di tengah SVG
 * sehingga label "Total" di tengah donut posisinya tepat — konsisten dengan
 * pola StatusKepegawaianChart.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { GenderStat } from '@/types/dashboard'

const GENDER_COLORS: Record<string, string> = {
  'Laki-laki':      'hsl(var(--primary))',
  'Perempuan':      'hsl(var(--pink))',
  '(Belum Terisi)': 'hsl(var(--muted-foreground) / 0.45)',
}

function getColor(label: string) {
  return GENDER_COLORS[label] ?? 'hsl(var(--muted-foreground) / 0.45)'
}

interface Props {
  data: GenderStat[]
  isLoading: boolean
  totalPegawai: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: GenderStat }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const isBelumTerisi = item.label === '(Belum Terisi)'
  return (
    <div
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        maxWidth: 220,
        boxShadow: '0 12px 32px -8px rgb(15 23 42 / 0.14), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
      }}
    >
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{item.label}</p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
        {item.jumlah} pegawai ({item.persentase}%)
      </p>
      {isBelumTerisi && (
        <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 6, fontSize: 11, lineHeight: 1.4 }}>
          Belum terisi di spreadsheet.
        </p>
      )}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-40 w-40 animate-pulse rounded-full bg-accent" />
      <div className="flex gap-4">
        <div className="h-3 w-20 animate-pulse rounded bg-accent" />
        <div className="h-3 w-16 animate-pulse rounded bg-accent" />
        <div className="h-3 w-24 animate-pulse rounded bg-accent" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-sm text-muted-foreground">Belum ada data gender.</p>
    </div>
  )
}

export default function GenderChart({ data, isLoading, totalPegawai }: Props) {
  const terisi = data.filter((d) => d.label !== '(Belum Terisi)').reduce((s, d) => s + d.jumlah, 0)
  const coveragePct = totalPegawai > 0 ? Math.round((terisi / totalPegawai) * 100) : 0

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">Distribusi Gender</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Jumlah pegawai per jenis kelamin ({terisi} dari {totalPegawai} pegawai)
            </CardDescription>
          </div>
          {!isLoading && totalPegawai > 0 && (
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold tabular-nums text-primary">
              {coveragePct}% terisi
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <div className="relative min-h-[175px] w-full flex-1 max-h-60">
              {/* Label Total di tengah donut */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold tabular-nums text-foreground">{totalPegawai}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={data}
                    dataKey="jumlah"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="84%"
                    paddingAngle={4}
                    cornerRadius={6}
                    strokeWidth={0}
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {data.map((d) => (
                      <Cell key={d.label} fill={getColor(d.label)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stat legend cards */}
            <div className="grid w-full shrink-0 grid-cols-2 gap-2.5">
              {data.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-2 dark:bg-background/35"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: getColor(d.label) }}
                    />
                    <span className="truncate text-xs font-medium text-foreground">
                      {d.label}
                    </span>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <span className="text-xs font-bold text-foreground">{d.jumlah}</span>
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      ({d.persentase}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
