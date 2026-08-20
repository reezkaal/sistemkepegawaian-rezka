/**
 * Donut Chart — Distribusi Tingkat Pendidikan Terakhir pegawai.
 * Menampilkan jumlah + persentase di legend list kanan.
 * Warna solid, tanpa gradient (CLAUDE.md § 4).
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { PendidikanStat } from '@/types/dashboard'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--cyan))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(226 60% 70%)',
  'hsl(var(--muted-foreground))',
]

interface Props {
  data: PendidikanStat[]
  isLoading: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: PendidikanStat }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        boxShadow: '0 12px 32px -8px rgb(15 23 42 / 0.14), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
      }}
    >
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{item.tingkat}</p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
        {item.jumlah} pegawai · {item.persentase}%
      </p>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex h-44 items-center gap-6">
      <div className="h-32 w-32 shrink-0 animate-pulse rounded-full bg-accent" />
      <div className="flex-1 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-accent" />
        ))}
      </div>
    </div>
  )
}

export default function PendidikanChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Distribusi Pendidikan</CardTitle>
          <CardDescription className="text-xs">Tingkat pendidikan terakhir pegawai</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Distribusi Pendidikan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada data pendidikan.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribusi Pendidikan</CardTitle>
        <CardDescription className="text-xs">Tingkat pendidikan terakhir pegawai</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="jumlah"
                  nameKey="tingkat"
                  cx="50%"
                  cy="50%"
                  innerRadius="48%"
                  outerRadius="70%"
                  paddingAngle={3}
                  cornerRadius={5}
                  strokeWidth={0}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <ul className="min-w-0 flex-1 space-y-2.5">
            {data.map((item, i) => (
              <li key={item.tingkat} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate text-foreground">{item.tingkat}</span>
                </div>
                <span className="shrink-0 font-medium text-muted-foreground">
                  {item.jumlah} <span className="text-muted-foreground/70">({item.persentase}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
