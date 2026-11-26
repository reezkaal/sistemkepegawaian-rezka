import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/layout/ThemeToggle'
import ProfileDialog from '@/components/profile/ProfileDialog'

interface HeaderProps {
  onToggleMobileNav: () => void
}

// Header light/white surface, sticky dengan aksen glass tipis (blur +
// transparansi) — bukan gradient, hanya kedalaman lapisan tipis di atas
// konten yang scroll di baliknya.
export default function Header({ onToggleMobileNav }: HeaderProps) {
  const { user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const initials = user?.displayName
    ?.split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <header className="glass-surface sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-gradient-to-r from-primary/[0.04] via-transparent to-cyan/[0.04] px-4 dark:from-primary/[0.08] dark:to-violet/[0.06] sm:px-6">
      <div className="flex items-center gap-3">
        {/* Tombol hamburger menu mobile */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 p-1.5 shadow-sm dark:bg-background/50">
            <img
              src="/logo-kemenhub.png"
              alt="Logo Kementerian Perhubungan Republik Indonesia"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">SIMPEG PPSDMPU</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Sistem Informasi Kepegawaian · Kemenhub RI
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <ThemeToggle />

        {user && (
          <>
            <div className="hidden h-6 w-px bg-border/80 sm:block" />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/55 px-2 py-1.5 text-left transition-all hover:border-primary/40 hover:bg-background/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-background/35 dark:hover:bg-background/60 sm:px-2.5"
              title="Klik untuk membuka profil & ganti password"
              aria-label="Profil Pengguna & Ganti Password"
            >
              <div className="hidden text-right leading-tight sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {user.displayName}
                  </p>
                  {user.role && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        user.role === 'superadmin'
                          ? 'border border-destructive/25 bg-destructive/15 text-destructive'
                          : user.role === 'admin'
                          ? 'border border-primary/25 bg-primary-soft text-primary'
                          : 'border border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-xs font-bold text-primary ring-1 ring-primary/25 transition-all group-hover:ring-2 group-hover:ring-primary/45">
                {initials}
              </div>
            </button>

            <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
          </>
        )}
      </div>
    </header>
  )
}
