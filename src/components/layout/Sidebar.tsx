import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, FileText, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import LogoutDialog from '@/components/layout/LogoutDialog'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pegawai', label: 'Pegawai', icon: Users },
  { to: '/cuti', label: 'Cuti', icon: CalendarDays },
  { to: '/persuratan', label: 'Persuratan', icon: FileText },
]

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleConfirmLogout() {
    logout()
    setConfirmOpen(false)
    onNavigate?.()
    // useAuth() tidak berbagi state global (lihat CLAUDE.md), jadi kita
    // navigate eksplisit supaya ProtectedRoute mount ulang & membaca
    // session (yang sudah kosong) dari awal.
    navigate('/login', { replace: true })
  }

  return (
    <nav className="flex h-full flex-col justify-between p-4" aria-label="Navigasi utama">
      <div>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-soft',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary-soft text-primary shadow-none'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      aria-hidden="true"
                    />
                    {label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        Logout
      </button>

      <LogoutDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleConfirmLogout} />
    </nav>
  )
}
