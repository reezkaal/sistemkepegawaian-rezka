import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  UserCog,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
  onToggleCollapse?: () => void
}

export default function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
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

  function navLinkClass(isActive: boolean) {
    return cn(
      'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ease-soft',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
      collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5',
      isActive
        ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-md shadow-primary/25'
        : cn(
          'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
          !collapsed && 'hover:translate-x-0.5',
        ),
    )
  }

  return (
    <nav
      className={cn(
        'sidebar-surface relative flex h-full flex-col justify-between overflow-hidden transition-all duration-300',
        collapsed ? 'p-2' : 'p-4',
      )}
      aria-label="Navigasi utama"
    >

      <div className="relative z-10">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/75">
            Menu Utama
          </p>
        )}
        <ul className={collapsed ? 'space-y-2' : 'space-y-1.5'}>
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-label={label}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'shrink-0 transition-colors',
                        collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/85" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 space-y-3">
        {onToggleCollapse && (
          <div className="hidden lg:flex lg:justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
              aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        <div className={cn('border-t border-border/80 pt-3', collapsed ? 'space-y-2' : 'space-y-1.5')}>
          {!collapsed && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/75">
              Administrasi
            </p>
          )}
          {canManageUsers && (
            <NavLink
              to="/kelola-pengguna"
              onClick={onNavigate}
              title={collapsed ? 'Kelola Pengguna' : undefined}
              aria-label="Kelola Pengguna"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <UserCog
                    className={cn(
                      'shrink-0 transition-colors',
                      collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>Kelola Pengguna</span>}
                  {!collapsed && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/85" aria-hidden="true" />
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
              'flex items-center rounded-xl text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed
                ? 'mx-auto h-10 w-10 justify-center'
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
      </div>

      <LogoutDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleConfirmLogout} />
    </nav>
  )
}
