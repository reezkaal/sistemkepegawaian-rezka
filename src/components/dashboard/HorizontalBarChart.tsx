/**
 * Horizontal Bar Chart — Reusable untuk Satker & Bidang/Bagian.
 *
 * Menggunakan full-width track bar (konsisten dengan UsiaChart) agar tidak
 * menyisakan ruang kosong berlebih di kiri/kanan pada kategori dengan nama
 * pendek seperti "UMUM" atau "PELATIHAN".
 */

import { useState } from 'react'
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
  /** Dipertahankan untuk kompatibilitas pemanggil */
  height?: number
  mutedLabels?: string[]
}

const RANK_GRADIENTS = [
  'linear-gradient(90deg, hsl(var(--teal)), hsl(var(--cyan)))',
  'linear-gradient(90deg, hsl(var(--cyan)), hsl(var(--primary)))',
  'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--indigo)))',
  'linear-gradient(90deg, hsl(var(--indigo)), hsl(var(--violet)))',
  'linear-gradient(90deg, hsl(var(--amber)), hsl(var(--orange)))',
]

interface TooltipState {
  label: string
  jumlah: number
  pct: number
  x: number
  y: number
}

const TOOLTIP_STYLE: React.CSSProperties = {
  position: 'fixed',
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  pointerEvents: 'none',
  zIndex: 50,
  boxShadow: '0 12px 32px -8px rgb(15 23 42 / 0.14), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
  minWidth: 150,
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-accent" />
          <div className="h-6 flex-1 animate-pulse rounded-md bg-accent" />
          <div className="h-4 w-14 shrink-0 animate-pulse rounded bg-accent" />
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
  mutedLabels = [],
}: HorizontalBarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const allMutedLabels = new Set(['(Belum Terisi)', ...mutedLabels])
  const isLabelMuted = (label: string) => allMutedLabels.has(label)

  const total = data.reduce((sum, d) => sum + d.jumlah, 0)
  const maxVal = data.reduce((m, d) => Math.max(m, d.jumlah), 1)

  function showTooltip(e: React.MouseEvent, label: string, jumlah: number, pct: number) {
    setTooltip({ label, jumlah, pct, x: e.clientX + 12, y: e.clientY - 8 })
  }
  function moveTooltip(e: React.MouseEvent) {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX + 12, y: e.clientY - 8 } : null))
  }
  function hideTooltip() {
    setTooltip(null)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
            )}
          </div>
          {!isLoading && data.length > 0 && (
            <span className="shrink-0 rounded-md bg-teal/10 px-2 py-1 text-[11px] font-semibold tabular-nums text-teal">
              {data.length} unit
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pt-2">
        {isLoading ? (
          <SkeletonRows count={4} />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col justify-center gap-3">
            {data.map((item, index) => {
              const barWidth = maxVal > 0 ? (item.jumlah / maxVal) * 100 : 0
              const pct = total > 0 ? Math.round((item.jumlah / total) * 100) : 0
              const muted = isLabelMuted(item.label)
              return (
                <div
                  key={item.label}
                  className="-mx-2 flex cursor-default items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-accent/50"
                  onMouseEnter={(e) => showTooltip(e, item.label, item.jumlah, pct)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <span
                    title={item.label}
                    className="w-24 shrink-0 truncate text-xs font-medium sm:w-28"
                    style={{
                      color: muted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                    }}
                  >
                    {item.label}
                  </span>
                  <div className="flex flex-1 items-center gap-2.5">
                    <div
                      className="overflow-hidden rounded-md bg-accent/80"
                      style={{ flex: 1, height: 24 }}
                    >
                      <div
                        className="h-full rounded-md transition-all duration-700 ease-out"
                        style={{
                          width: `${barWidth}%`,
                          background: muted
                            ? 'hsl(var(--muted-foreground) / 0.35)'
                            : RANK_GRADIENTS[index % RANK_GRADIENTS.length],
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                      {item.jumlah}
                      <span className="ml-1 font-normal text-muted-foreground/75">({pct}%)</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x, top: tooltip.y }}>
          <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{tooltip.label}</p>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
            {tooltip.jumlah} pegawai ({tooltip.pct}%)
          </p>
        </div>
      )}
    </Card>
  )
}
