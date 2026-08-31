import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone?: 'primary' | 'success' | 'warning' | 'cyan' | 'violet' | 'orange' | 'amber'
  /** Teks kecil opsional di bawah angka, mis. "dari 9 pegawai". */
  hint?: string
}

// Warna SOLID saja - tidak ada gradient (lihat CLAUDE.md § 4). Chip ikon
// pakai warna soft (10% opacity) + ikon warna solid, bukan block warna
// penuh — kesan lebih "premium enterprise" & tidak berat secara visual.
// Beberapa tone dipakai supaya dashboard tidak didominasi biru tunggal
// (lihat brief redesign § 2).
const TONE_STYLES: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  cyan: 'bg-cyan/10 text-cyan',
  violet: 'bg-violet/10 text-violet',
  orange: 'bg-orange/10 text-orange',
  amber: 'bg-amber/10 text-amber',
}

export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint }: StatCardProps) {
  return (
    <Card interactive className="group">
      <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-foreground">
            {value.toLocaleString('id-ID')}
          </p>
          {hint && <p className="mt-2 truncate text-xs text-muted-foreground/80">{hint}</p>}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-soft group-hover:scale-105',
            TONE_STYLES[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-24 animate-pulse rounded bg-accent" />
          <div className="h-7 w-16 animate-pulse rounded bg-accent" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-accent" aria-hidden="true" />
      </CardContent>
    </Card>
  )
}
