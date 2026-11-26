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
const TONE_STYLES: Record<
  NonNullable<StatCardProps['tone']>,
  { icon: string; card: string }
> = {
  primary: {
    icon: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    card: 'border-t-[3px] border-t-primary bg-gradient-to-br from-primary/[0.06] via-card to-card',
  },
  success: {
    icon: 'bg-success/15 text-success ring-1 ring-success/20',
    card: 'border-t-[3px] border-t-success bg-gradient-to-br from-success/[0.06] via-card to-card',
  },
  warning: {
    icon: 'bg-warning/15 text-warning ring-1 ring-warning/25',
    card: 'border-t-[3px] border-t-warning bg-gradient-to-br from-warning/[0.07] via-card to-card',
  },
  cyan: {
    icon: 'bg-cyan/15 text-cyan ring-1 ring-cyan/20',
    card: 'border-t-[3px] border-t-cyan bg-gradient-to-br from-cyan/[0.06] via-card to-card',
  },
  violet: {
    icon: 'bg-violet/15 text-violet ring-1 ring-violet/20',
    card: 'border-t-[3px] border-t-violet bg-gradient-to-br from-violet/[0.06] via-card to-card',
  },
  orange: {
    icon: 'bg-orange/15 text-orange ring-1 ring-orange/20',
    card: 'border-t-[3px] border-t-orange bg-gradient-to-br from-orange/[0.06] via-card to-card',
  },
  amber: {
    icon: 'bg-amber/15 text-amber ring-1 ring-amber/25',
    card: 'border-t-[3px] border-t-amber bg-gradient-to-br from-amber/[0.07] via-card to-card',
  },
}

export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint }: StatCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <Card interactive className={cn('group overflow-hidden', styles.card)}>
      <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
            {value.toLocaleString('id-ID')}
          </p>
          {hint && <p className="mt-2 truncate text-xs text-muted-foreground/85">{hint}</p>}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-soft group-hover:scale-105',
            styles.icon,
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
