import { Files, Inbox, Send, AlertCircle, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DataSourceStatus } from '@/types/persuratan'

interface SummaryCardItem {
  label: string
  value: number
  icon: LucideIcon
  hint: string
  iconTone: string
  valueColor?: string
}

interface Props {
  total: number
  masuk: number
  keluar: number
  tidakLengkap: number
  dataSourceStatus: DataSourceStatus
}

export default function PersuratanSummaryCards({
  total,
  masuk,
  keluar,
  tidakLengkap,
  dataSourceStatus,
}: Props) {
  const isConnected = dataSourceStatus === 'connected'

  const cards: SummaryCardItem[] = [
    {
      label: 'Total Naskah',
      value: total,
      icon: Files,
      hint: 'Seluruh naskah tercatat',
      iconTone: 'bg-primary-soft text-primary',
    },
    {
      label: 'Naskah Masuk',
      value: masuk,
      icon: Inbox,
      hint: 'Naskah dinas diterima',
      iconTone: 'bg-success/10 text-success',
    },
    {
      label: 'Naskah Keluar',
      value: keluar,
      icon: Send,
      hint: 'Naskah diterbitkan',
      iconTone: 'bg-sky-500/10 text-sky-500',
    },
    {
      label: 'Data Belum Lengkap',
      value: tidakLengkap,
      icon: AlertCircle,
      hint: tidakLengkap > 0 ? 'Perlu dilengkapi' : 'Semua data lengkap',
      iconTone: 'bg-amber-500/10 text-amber-500',
      valueColor: tidakLengkap > 0 ? 'text-amber-500' : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} interactive className="group relative overflow-hidden">
            <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={cn(
                    'mt-2 text-2xl font-bold leading-none tracking-tight tabular-nums sm:text-[1.75rem]',
                    card.valueColor ?? 'text-foreground',
                  )}
                >
                  {isConnected ? card.value.toLocaleString('id-ID') : '-'}
                </p>
                <p className="mt-2 truncate text-xs text-muted-foreground/80">
                  {isConnected ? card.hint : 'Sumber belum terhubung'}
                </p>
              </div>

              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-soft group-hover:scale-105 sm:h-11 sm:w-11',
                  card.iconTone,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
