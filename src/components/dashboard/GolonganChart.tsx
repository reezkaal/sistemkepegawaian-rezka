/**
 * GolonganChart — Distribusi Golongan Pegawai.
 *
 * Vertical bar/column chart full-width. Menampilkan SEMUA kategori
 * golongan aktual dari spreadsheet (termasuk "(Belum Terisi)").
 * Warna amber = golongan terisi; muted = belum terisi.
 * Label X-axis dirotasi 40° agar semua kategori terbaca.
 *
 * Data dari getEmployeeChartData() → golongan[] — tidak ada limit Top-N.
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

interface GolonganItem {
  golongan: string
  jumlah: number
}

interface Props {
  data: GolonganItem[]
  isLoading: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: GolonganItem }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const isMuted = item.golongan === '(Belum Terisi)'
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
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
        {isMuted ? item.golongan : `Golongan ${item.golongan}`}
      </p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
        {item.jumlah} pegawai
      </p>
      {isMuted && (
        <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 4, fontSize: 11 }}>
          Belum terisi di spreadsheet
        </p>
      )}
    </div>
  )
}

function SkeletonBars() {
  return (
    <div className="flex items-end gap-2 px-2" style={{ height: 260 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t-sm bg-accent"
          style={{ height: `${30 + (i % 5) * 18}%` }}
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-52 items-center justify-center">
      <p className="text-sm text-muted-foreground">Belum ada data golongan.</p>
    </div>
  )
}

interface CustomTickProps {
  x?: number
  y?: number
  payload?: { value: string }
}

function CustomXTick({ x = 0, y = 0, payload }: CustomTickProps) {
  const isMuted = payload?.value === '(Belum Terisi)'
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        transform="rotate(-40)"
        fontSize={11}
        fill={isMuted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))'}
      >
        {payload?.value}
      </text>
    </g>
  )
}

export default function GolonganChart({ data, isLoading }: Props) {
  const total = data.reduce((s, d) => s + d.jumlah, 0)
  const terisi = data.filter((d) => d.golongan !== '(Belum Terisi)').reduce((s, d) => s + d.jumlah, 0)
  const maxVal = data.reduce((m, d) => Math.max(m, d.jumlah), 0)

  // Nilai Roman numeral → angka, untuk urutan yang benar (IX=9, bukan setelah I)
  const ROMAN: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5,
    VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
  }
  function parseGolongan(g: string): [number, string] {
    const [roman = '', sub = ''] = g.split('/')
    return [ROMAN[roman.toUpperCase()] ?? 999, sub.toLowerCase()]
  }

  // Urutkan berdasarkan nilai Roman numeral, lalu subgolongan alfabet, (Belum Terisi) di akhir
  const sorted = [...data].sort((a, b) => {
    if (a.golongan === '(Belum Terisi)') return 1
    if (b.golongan === '(Belum Terisi)') return -1
    const [aNum, aSub] = parseGolongan(a.golongan)
    const [bNum, bSub] = parseGolongan(b.golongan)
    if (aNum !== bNum) return aNum - bNum
    return aSub.localeCompare(bSub)
  })

  const yDomain: [number, number] = [0, Math.ceil(maxVal * 1.3)]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold">Distribusi Golongan</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              {terisi} dari {total} pegawai memiliki data golongan · abu-abu = belum terisi
            </CardDescription>
          </div>
          <span className="shrink-0 rounded-md bg-amber/10 px-2 py-1 text-xs font-semibold text-amber">
            {data.length} kategori
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {isLoading ? (
          <SkeletonBars />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={sorted}
              margin={{ top: 16, right: 12, left: 0, bottom: 60 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="golongan"
                tick={<CustomXTick />}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval={0}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar
                dataKey="jumlah"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {sorted.map((d, index) => (
                  <Cell
                    key={index}
                    fill={
                      d.golongan === '(Belum Terisi)'
                        ? 'hsl(var(--muted-foreground) / 0.35)'
                        : 'hsl(var(--amber))'
                    }
                  />
                ))}
                <LabelList
                  dataKey="jumlah"
                  position="top"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: 'hsl(var(--foreground))',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
