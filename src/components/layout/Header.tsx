import { Menu, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/layout/ThemeToggle'

interface HeaderProps {
  onToggleMobileNav: () => void
}

// Header light/white surface, sticky dengan aksen glass tipis (blur +
// transparansi) — bukan gradient, hanya kedalaman lapisan tipis di atas
// konten yang scroll di baliknya.
export default function Header({ onToggleMobileNav }: HeaderProps) {
  const { user } = useAuth()

  const initials = user?.displayName
    ?.split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <header className="glass-surface sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-soft">
            <Building2 className="h-[18px] w-[18px] text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">SIMPEG PPSDMPU</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Sistem Informasi Kepegawaian
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
                {initials}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
