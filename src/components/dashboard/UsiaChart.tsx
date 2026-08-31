/**
 * UsiaChart - Distribusi Kelompok Usia Pegawai.
 * Dihitung dari field tanggalLahir.
 * 5 kelompok: <30 / 30-39 / 40-49 / 50-59 / 60+.
 * Setiap kelompok usia memakai shade/tingkatan violet yang berbeda (bukan satu
 * warna rata) supaya kelompok mudah dibedakan sekilas. "(Belum Terisi)" — jika
 * pernah muncul di data — tetap muted/abu-abu, bukan violet.
 * Bar horizontal, coverage ringkas, label tidak terpotong.
 * Tooltip hover: nama kelompok, jumlah, persentase — konsisten dgn Satker.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { UsiaStat } from "@/types/dashboard";

interface Props {
  data: UsiaStat[]
  isLoading: boolean
  dataValid: number
  totalPegawai: number
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-accent shrink-0" />
          <div className="h-6 flex-1 animate-pulse rounded-md bg-accent" />
          <div className="h-4 w-16 animate-pulse rounded bg-accent shrink-0" />
        </div>
      ))}
    </div>
  )
}

interface TooltipState {
  label: string
  jumlah: number
  pct: number
  x: number
  y: number
}

const MUTED_KELOMPOK = "(Belum Terisi)"

/**
 * Shade violet berbeda per kelompok usia — dari paling muda (paling terang)
 * ke paling tua (paling pekat), diskalakan otomatis terhadap jumlah kelompok
 * agar tetap konsisten walau jumlah kelompok berubah di masa depan.
 */
function violetShadeOpacity(index: number, total: number) {
  if (total <= 1) return 1
  const min = 0.45
  const max = 1
  return min + (index / (total - 1)) * (max - min)
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
  minWidth: 140,
}

export default function UsiaChart({ data, isLoading, dataValid, totalPegawai }: Props) {
  const maxJumlah = data.reduce((m, d) => Math.max(m, d.jumlah), 1)
  const coveragePct = totalPegawai > 0 ? Math.round((dataValid / totalPegawai) * 100) : 0

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  function showTooltip(e: React.MouseEvent, label: string, jumlah: number, pct: number) {
    setTooltip({ label, jumlah, pct, x: e.clientX + 12, y: e.clientY - 8 })
  }
  function moveTooltip(e: React.MouseEvent) {
    setTooltip((prev) => prev ? { ...prev, x: e.clientX + 12, y: e.clientY - 8 } : null)
  }
  function hideTooltip() {
    setTooltip(null)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribusi Usia</CardTitle>
        <CardDescription className="text-xs">
          Data tanggal lahir tersedia: {dataValid}/{totalPegawai} pegawai ({coveragePct}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {isLoading ? (
          <Skeleton />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data tanggal lahir.</p>
        ) : (
          <div className="flex h-full flex-col justify-center gap-2">
            {data.map((item, index) => {
              const barWidth = maxJumlah > 0 ? (item.jumlah / maxJumlah) * 100 : 0
              const pct = totalPegawai > 0 ? Math.round((item.jumlah / totalPegawai) * 100) : 0
              const isMuted = item.kelompok === MUTED_KELOMPOK
              return (
                <div
                  key={item.kelompok}
                  // flex-1 + min/max-h: baris ikut mengisi tinggi card saat
                  // disejajarkan dengan card Gender yang lebih tinggi, tanpa
                  // membuat bar jadi tidak proporsional (dibatasi max-h).
                  className="-mx-2 flex max-h-[52px] min-h-[30px] flex-1 cursor-default items-center gap-3 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-accent/50"
                  onMouseEnter={(e) => showTooltip(e, item.kelompok, item.jumlah, pct)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <span
                    className="w-24 shrink-0 truncate text-xs font-medium"
                    style={{ color: isMuted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}
                  >
                    {item.kelompok}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className="overflow-hidden rounded-sm bg-accent"
                      style={{ flex: 1, height: 22 }}
                    >
                      <div
                        className="h-full rounded-sm transition-all duration-700 ease-out"
                        style={{
                          width: `${barWidth}%`,
                          background: isMuted
                            ? 'hsl(var(--muted-foreground) / 0.4)'
                            : 'hsl(var(--violet))',
                          opacity: isMuted ? 1 : violetShadeOpacity(index, data.length),
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                      {item.jumlah}
                      <span className="ml-1 font-normal text-muted-foreground/70">({pct}%)</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Tooltip — fixed position mengikuti kursor */}
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x, top: tooltip.y }}>
          <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{tooltip.label}</p>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
            {tooltip.jumlah} pegawai
          </p>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
            {tooltip.pct}% dari total
          </p>
        </div>
      )}
    </Card>
  )
}
