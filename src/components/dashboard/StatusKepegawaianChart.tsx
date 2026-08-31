/**
 * Donut Chart — Distribusi Status Kepegawaian (PNS / PPPK / Belum Terisi).
 * "(Belum Terisi)" = field status kosong di spreadsheet, BUKAN pegawai nonaktif.
 * Warna mengikuti badge Status Kepegawaian di tabel Pegawai (lihat
 * `statusTone` di EmployeeTable.tsx) & KPI card Dashboard (StatCard tone):
 *   PNS  = biru   (primary)
 *   PPPK = hijau  (success/emerald)
 *   Belum Terisi = abu-abu (muted)
 *
 * Legend dipisah keluar dari PieChart agar cy="50%" benar-benar di tengah SVG
 * sehingga label "Total" di tengah donut posisinya tepat.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { StatusKepegawaianStat } from '@/types/dashboard'

const STATUS_COLORS: Record<string, string> = {
  'PNS':             'hsl(var(--primary))',
  'PPPK':            'hsl(var(--success))',
  'Tanpa Status':    'hsl(var(--muted-foreground) / 0.45)',
  '(Belum Terisi)':  'hsl(var(--muted-foreground) / 0.45)',
}
const FALLBACK_COLORS = [
  'hsl(var(--cyan))',
  'hsl(var(--warning))',
]

function getColor(status: string, index: number) {
  return STATUS_COLORS[status] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function displayLabel(status: string) {
  return status === 'Tanpa Status' ? '(Belum Terisi)' : status
}

interface Props {
  data: StatusKepegawaianStat[]
  isLoading: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: StatusKepegawaianStat }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const isBelumTerisi = item.status === 'Tanpa Status' || item.status === '(Belum Terisi)'
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
      <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{displayLabel(item.status)}</p>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
        {item.jumlah} pegawai ({item.persentase}%)
      </p>
      {isBelumTerisi && (
        <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 6, fontSize: 11, lineHeight: 1.4 }}>
          Belum terisi di spreadsheet. Bukan berarti nonaktif.
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
      <p className="text-sm text-muted-foreground">Belum ada data status kepegawaian.</p>
    </div>
  )
}

export default function StatusKepegawaianChart({ data, isLoading }: Props) {
  const total = data.reduce((s, d) => s + d.jumlah, 0)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Status Kepegawaian</CardTitle>
        <CardDescription className="text-xs">
          PNS, PPPK, dan data belum terisi di spreadsheet
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
            {/* Donut chart — legend dipisah supaya cy="50%" benar-benar di tengah.
                Wrapper memakai flex-1 (bukan tinggi tetap) supaya donut ikut
                mengisi tinggi card saat disejajarkan dengan card Satker/Bidang
                yang lebih tinggi — mengurangi whitespace kosong di baris Status
                & Unit Kerja tanpa mengubah data/logic. */}
            <div className="relative min-h-[160px] w-full flex-1 max-h-64">
              {/* Label Total di tengah donut */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={data}
                    dataKey="jumlah"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="72%"
                    paddingAngle={3}
                    cornerRadius={5}
                    strokeWidth={0}
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {data.map((d, index) => (
                      <Cell key={d.status} fill={getColor(d.status, index)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legend — di luar PieChart supaya tidak geser cy */}
            <div className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1.5">
              {data.map((d, index) => {
                const isMuted = d.status === 'Tanpa Status' || d.status === '(Belum Terisi)'
                return (
                  <div key={d.status} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ background: getColor(d.status, index) }}
                    />
                    <span
                      className="text-xs tabular-nums"
                      style={{
                        color: isMuted
                          ? 'hsl(var(--muted-foreground))'
                          : 'hsl(var(--foreground))',
                      }}
                    >
                      <span className={isMuted ? '' : 'font-medium'}>{displayLabel(d.status)}</span>
                      <span className="ml-1">{d.jumlah}</span>
                      <span className="ml-1 text-muted-foreground">({d.persentase}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
