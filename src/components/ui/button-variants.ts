/**
 * buttonVariants — CVA variants untuk Button.
 *
 * Dipisah ke file sendiri agar `button.tsx` hanya mengekspor komponen
 * React (syarat Fast Refresh). Tidak ada perubahan behaviour.
 */
import { cva } from 'class-variance-authority'

// Warna SOLID saja - tidak ada gradient (lihat CLAUDE.md § 4).
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-primary-soft hover:text-primary-soft-foreground',
        outline: 'border border-input bg-background hover:border-primary/40 hover:bg-primary-soft hover:text-primary-soft-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
