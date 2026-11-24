import { useState } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/layout/ThemeToggle'
import ProfileDialog from '@/components/profile/ProfileDialog'

interface HeaderProps {
  onToggleMobileNav: () => void
  onToggleDesktopSidebar?: () => void
  isSidebarCollapsed?: boolean
}

// Header light/white surface, sticky dengan aksen glass tipis (blur +
// transparansi) — bukan gradient, hanya kedalaman lapisan tipis di atas
// konten yang scroll di baliknya.
export default function Header({
  onToggleMobileNav,
  onToggleDesktopSidebar,
  isSidebarCollapsed = false,
}: HeaderProps) {
  const { user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const initials = user?.displayName
    ?.split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <header className="glass-surface sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Tombol hamburger menu mobile */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Tombol collapse/expand sidebar desktop (ikon saja) */}
        {onToggleDesktopSidebar && (
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
            title={isSidebarCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar (hanya ikon)'}
            aria-label={isSidebarCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar (hanya ikon)'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <img
            src="/logo-kemenhub.png"
            alt="Logo Kementerian Perhubungan Republik Indonesia"
            className="h-9 w-9 shrink-0 object-contain"
          />
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
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
              title="Klik untuk membuka profil & ganti password"
              aria-label="Profil Pengguna & Ganti Password"
            >
              <div className="hidden text-right leading-tight sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {user.displayName}
                  </p>
                  {user.role && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        user.role === 'superadmin'
                          ? 'bg-destructive/15 text-destructive border border-destructive/20'
                          : user.role === 'admin'
                          ? 'bg-primary-soft text-primary border border-primary/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-soft-foreground group-hover:ring-2 group-hover:ring-primary/40 transition-all">
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
