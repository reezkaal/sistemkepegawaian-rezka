/**
 * Donut Chart — Distribusi Status Kepegawaian (PNS vs PPPK).
 * Menampilkan total di tengah, legend + persentase di samping.
 * Warna solid, tanpa gradient (CLAUDE.md § 4).
 */

import type { ComponentProps } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { StatusKepegawaianStat } from '@/types/dashboard'

// Palet warna solid — primary + accent semantik sesuai design tokens baru.
const COLORS = [
  'hsl(var(--primary))',      // PNS — primary blue
  'hsl(var(--success))',      // PPPK — emerald (selaras dengan badge status)
  'hsl(var(--cyan))',
  'hsl(var(--muted-foreground))',
]

interface Props {
  data: StatusKepegawaianStat[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: StatusKepegawaianStat }>
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
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{item.status}</p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
        {item.jumlah} pegawai ({item.persentase}%)
      </p>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex h-52 items-center justify-center gap-6">
      <div className="h-40 w-40 animate-pulse rounded-full bg-accent" />
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-accent" />
        <div className="h-4 w-24 animate-pulse rounded bg-accent" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-52 items-center justify-center">
      <p className="text-sm text-muted-foreground">Belum ada data status kepegawaian.</p>
    </div>
  )
}

/**
 * Tipe `formatter` diturunkan langsung dari komponen `Legend` recharts
 * (bukan ditulis manual) supaya selalu cocok dengan signature yang
 * sesungguhnya diharapkan oleh recharts — akar masalah error build
 * sebelumnya adalah tipe custom yang tidak sesuai dengan `Formatter`
 * bawaan recharts.
 *
 * Catatan: tipe `entry.payload` bawaan recharts sengaja digeneralisasi
 * (`{ strokeDasharray: ReactText }`), tidak mengikuti bentuk data chart
 * sesungguhnya — ini keterbatasan typing yang sudah dilaporkan di
 * recharts (lihat issue recharts/recharts#2909 dan #5508). Saat runtime,
 * untuk <Pie>, `entry.payload` berisi item data asli (StatusKepegawaianStat),
 * sehingga satu assertion di titik ini diperlukan & didokumentasikan,
 * BUKAN `any` yang menghilangkan pengecekan tipe secara keseluruhan.
 */
type LegendFormatter = NonNullable<ComponentProps<typeof Legend>['formatter']>

const legendFormatter: LegendFormatter = (value, entry) => {
  const stat = entry?.payload as unknown as StatusKepegawaianStat | undefined
  return (
    <span style={{ fontSize: 12, color: 'hsl(var(--foreground))' }}>
      {value}{' '}
      <span style={{ color: 'hsl(var(--muted-foreground))' }}>({stat?.persentase ?? 0}%)</span>
    </span>
  )
}

export default function StatusKepegawaianChart({
  data,
  isLoading,
}: Props & { isLoading: boolean }) {
  const total = data.reduce((s, d) => s + d.jumlah, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Status Kepegawaian</CardTitle>
        <CardDescription className="text-xs">Distribusi PNS dan PPPK</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative h-52">
            {/* Total di tengah donut */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="jumlah"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="72%"
                  paddingAngle={4}
                  cornerRadius={6}
                  strokeWidth={0}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={legendFormatter}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
