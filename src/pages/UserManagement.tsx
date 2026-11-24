import { useState, useEffect, useCallback } from 'react'
import {
  UserCog,
  UserPlus,
  RotateCw,
  AlertCircle,
  Shield,
  ShieldCheck,
  User,
  Edit2,
  KeyRound,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { listUsers, type ProfileUser } from '@/services/userManagement'
import AddUserDialog from '@/components/user/AddUserDialog'
import EditUserDialog from '@/components/user/EditUserDialog'
import ResetPasswordDialog from '@/components/user/ResetPasswordDialog'
import DeleteUserDialog from '@/components/user/DeleteUserDialog'
import { cn } from '@/lib/utils'

const ROLE_CONFIG = {
  superadmin: { label: 'Superadmin', icon: Shield, tone: 'destructive' as const },
  admin: { label: 'Admin', icon: ShieldCheck, tone: 'warning' as const },
  user: { label: 'User', icon: User, tone: 'muted' as const },
} as const

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ProfileUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Dialog state untuk aksi edit, reset password, dan hapus
  const [editingUser, setEditingUser] = useState<ProfileUser | null>(null)
  const [resettingUser, setResettingUser] = useState<ProfileUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<ProfileUser | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar pengguna.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSupabaseConfigured) fetchUsers()
    else setIsLoading(false)
  }, [fetchUsers])

  // Jika Supabase belum dikonfigurasi
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Pengguna</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <p className="text-sm font-medium text-foreground">Supabase Belum Dikonfigurasi</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Fitur kelola pengguna memerlukan koneksi Supabase. Isi VITE_SUPABASE_URL dan
              VITE_SUPABASE_ANON_KEY di file .env, lalu restart dev server.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const counts = {
    total: users.length,
    superadmin: users.filter((u) => u.role === 'superadmin').length,
    admin: users.filter((u) => u.role === 'admin').length,
    user: users.filter((u) => u.role === 'user').length,
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Pengguna</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun pengguna sistem SIMPEG PPSDMPU.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-secondary hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Refresh daftar pengguna"
          >
            <RotateCw className={cn('h-3.5 w-3.5 text-muted-foreground', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip icon={UserCog} label="Total" value={counts.total} tone="violet" />
        <SummaryChip icon={Shield} label="Superadmin" value={counts.superadmin} tone="destructive" />
        <SummaryChip icon={ShieldCheck} label="Admin" value={counts.admin} tone="warning" />
        <SummaryChip icon={User} label="User" value={counts.user} tone="muted" />
      </div>

      {/* User Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">NIP</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <RotateCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="text-xs text-destructive">{error}</span>
                      <button
                        type="button"
                        onClick={fetchUsers}
                        className="mt-1 text-xs font-medium text-primary hover:underline"
                      >
                        Coba lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.user
                  const isSuperadmin = u.role === 'superadmin'
                  const isCurrent = u.id === currentUser?.id
                  const canManage = currentUser?.role === 'superadmin' || !isSuperadmin

                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{u.nama}</span>
                        {isCurrent && (
                          <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {u.nip || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={rc.tone}>
                          <rc.icon className="h-3 w-3" aria-hidden="true" />
                          {rc.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManage ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingUser(u)}
                              title="Edit Pengguna"
                              aria-label="Edit Pengguna"
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResettingUser(u)}
                              title="Reset Password"
                              aria-label="Reset Password"
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-warning/10 hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => setDeletingUser(u)}
                                title="Hapus Pengguna"
                                aria-label="Hapus Pengguna"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">Terkunci</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Dialog */}
      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchUsers}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={fetchUsers}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resettingUser}
        open={Boolean(resettingUser)}
        onOpenChange={(open) => !open && setResettingUser(null)}
        onSuccess={fetchUsers}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={deletingUser}
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onSuccess={fetchUsers}
      />
    </div>
  )
}

function SummaryChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof UserCog
  label: string
  value: number
  tone: 'violet' | 'destructive' | 'warning' | 'muted'
}) {
  const toneStyles = {
    violet: 'bg-violet/10 text-violet',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning/10 text-warning',
    muted: 'bg-muted text-muted-foreground',
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneStyles}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

