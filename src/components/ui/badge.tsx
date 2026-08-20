import * as React from 'react'
import { cn } from '@/lib/utils'

// Warna SOLID saja - tidak ada gradient (lihat CLAUDE.md § 4).
export type BadgeTone = 'success' | 'muted' | 'warning' | 'destructive' | 'secondary'

const TONE_STYLES: Record<BadgeTone, string> = {
  success: 'bg-success/10 text-success',
  muted: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  secondary: 'bg-primary-soft text-primary-soft-foreground',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = 'secondary', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    />
  ),
)
Badge.displayName = 'Badge'

export { Badge }
