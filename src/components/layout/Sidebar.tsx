import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  UserCog,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import LogoutDialog from '@/components/layout/LogoutDialog'

import type { UserRole } from '@/types/auth'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pegawai', label: 'Pegawai', icon: Users, roles: ['superadmin', 'admin'] },
  { to: '/cuti', label: 'Cuti', icon: CalendarDays },
  { to: '/persuratan', label: 'Persuratan', icon: FileText, roles: ['superadmin', 'admin'] },
]

interface SidebarProps {
  onNavigate?: () => void
  collapsed?: boolean
}

export default function Sidebar({ onNavigate, collapsed = false }: SidebarProps) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const canManageUsers = role === 'superadmin' || role === 'admin'

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true
    if (!role) return false
    return item.roles.includes(role)
  })

  function handleConfirmLogout() {
    logout()
    setConfirmOpen(false)
    onNavigate?.()
    navigate('/login', { replace: true })
  }

  return (
    <nav
      className={cn(
        'flex h-full flex-col justify-between transition-all duration-300',
        collapsed ? 'p-2' : 'p-4',
      )}
      aria-label="Navigasi utama"
    >
      <div>
        <ul className={collapsed ? 'space-y-2' : 'space-y-1'}>
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-label={label}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-soft',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed
                      ? 'h-10 w-10 mx-auto justify-center'
                      : 'gap-3 px-3 py-2.5',
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
                        'shrink-0 transition-colors',
                        collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn('border-t border-border pt-3', collapsed ? 'space-y-2' : 'space-y-1')}>
        {canManageUsers && (
          <NavLink
            to="/kelola-pengguna"
            onClick={onNavigate}
            title={collapsed ? 'Kelola Pengguna' : undefined}
            aria-label="Kelola Pengguna"
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-soft',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed
                  ? 'h-10 w-10 mx-auto justify-center'
                  : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-primary-soft text-primary shadow-none'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <UserCog
                  className={cn(
                    'shrink-0 transition-colors',
                    collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span>Kelola Pengguna</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </>
            )}
          </NavLink>
        )}

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          title={collapsed ? 'Logout' : undefined}
          aria-label="Logout"
          className={cn(
            'flex items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed
              ? 'h-10 w-10 mx-auto justify-center'
              : 'w-full gap-3 px-3 py-2.5',
          )}
        >
          <LogOut
            className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]')}
            aria-hidden="true"
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <LogoutDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleConfirmLogout} />
    </nav>
  )
}
