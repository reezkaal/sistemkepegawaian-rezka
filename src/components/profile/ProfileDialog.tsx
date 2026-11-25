import { useState } from 'react'
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Hash,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { changeOwnPassword } from '@/services/userManagement'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setError(null)
      setSuccess(false)
    }
    onOpenChange(nextOpen)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!currentPassword) {
      setError('Password lama wajib diisi.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setIsSubmitting(true)
    try {
      await changeOwnPassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const initials = user.displayName
    ?.split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  const roleBadge = {
    superadmin: { label: 'Superadmin', tone: 'destructive' as const, icon: Shield },
    admin: { label: 'Admin', tone: 'warning' as const, icon: ShieldCheck },
    user: { label: 'User Pegawai', tone: 'muted' as const, icon: User },
  }[user.role] || { label: 'User', tone: 'muted' as const, icon: User }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profil Pengguna</DialogTitle>
          <DialogDescription>
            Informasi akun dan pengaturan kata sandi Anda.
          </DialogDescription>
        </DialogHeader>

        {/* User Info Header Card */}
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{user.displayName}</h3>
              <Badge tone={roleBadge.tone} className="shrink-0">
                <roleBadge.icon className="h-3 w-3" />
                {roleBadge.label}
              </Badge>
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Hash className="h-3.5 w-3.5" />
                <span>NIP: {user.nip || 'Belum diisi'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mt-2 space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <KeyRound className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Ganti Password Mandiri</h4>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Password berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="profile-current-pass" className="text-xs">Password Lama</Label>
              <Input
                id="profile-current-pass"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="profile-new-pass" className="text-xs">Password Baru</Label>
              <div className="relative">
                <Input
                  id="profile-new-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="profile-confirm-pass" className="text-xs">Konfirmasi Password Baru</Label>
              <Input
                id="profile-confirm-pass"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword}
              className="w-full text-xs"
              size="sm"
            >
              {isSubmitting ? 'Memperbarui...' : 'Simpan Password Baru'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

