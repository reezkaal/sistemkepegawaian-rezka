/**
 * Horizontal Bar Chart — Reusable untuk Golongan, Satker, Bidang/Bagian.
 *
 * - Sorted dari terbesar ke terkecil (dilakukan di service layer)
 * - Value ditampilkan di ujung kanan bar
 * - Bar radius rounded
 * - Tooltip modern: nama kategori + jumlah pegawai
 * - Warna solid, tanpa gradient (CLAUDE.md § 4)
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface DataItem {
  label: string
  jumlah: number
}

interface HorizontalBarChartProps {
  title: string
  description?: string
  data: DataItem[]
  isLoading: boolean
  barColor?: string
  /** Tinggi chart dalam px, default otomatis berdasarkan jumlah item */
  height?: number
}

// Bar height per item + padding
const ROW_HEIGHT = 36

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: DataItem }>
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
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{item.label}</p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{item.jumlah} pegawai</p>
    </div>
  )
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="h-4 animate-pulse rounded-md bg-accent"
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-24 items-center justify-center">
      <p className="text-sm text-muted-foreground">Belum ada data.</p>
    </div>
  )
}

export default function HorizontalBarChart({
  title,
  description,
  data,
  isLoading,
  barColor = 'hsl(var(--primary))',
  height,
}: HorizontalBarChartProps) {
  const chartHeight = height ?? Math.max(data.length * ROW_HEIGHT, 80)

  // Max value untuk menentukan domain XAxis
  const maxVal = data.reduce((m, d) => Math.max(m, d.jumlah), 0)
  // Tambah 20% padding kanan agar label tidak terpotong
  const xDomain: [number, number] = [0, Math.ceil(maxVal * 1.35)]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonRows count={4} />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 2, right: 36, left: 4, bottom: 2 }}
              barCategoryGap="32%"
            >
              <CartesianGrid
                horizontal={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                domain={xDomain}
                hide
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar
                dataKey="jumlah"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={barColor}
                    fillOpacity={Math.max(0.45, 1 - index * 0.12)}
                  />
                ))}
                <LabelList
                  dataKey="jumlah"
                  position="right"
                  style={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
