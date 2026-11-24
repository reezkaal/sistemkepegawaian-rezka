import { useState, useEffect } from 'react'
import { Edit2, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { updateUser, type ProfileUser } from '@/services/userManagement'
import type { UserRole } from '@/types/auth'

interface EditUserDialogProps {
  user: ProfileUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const { role: callerRole } = useAuth()
  const [nama, setNama] = useState('')
  const [nip, setNip] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setNama(user.nama || '')
      setNip(user.nip || '')
      setRole(user.role)
      setError(null)
      setSuccess(false)
    }
  }, [user, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (!nama.trim()) {
      setError('Nama lengkap wajib diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      await updateUser(user.id, {
        nama: nama.trim(),
        nip: nip.trim() || undefined,
        role,
      })
      setSuccess(true)
      onSuccess()
      setTimeout(() => {
        onOpenChange(false)
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui pengguna.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions: { value: UserRole; label: string }[] =
    callerRole === 'superadmin'
      ? [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        { value: 'superadmin', label: 'Superadmin' },
      ]
      : [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
      ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Edit2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Edit Data Pengguna</DialogTitle>
          <DialogDescription>
            Perbarui nama lengkap, NIP, atau peranan (role) akun.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">Data pengguna berhasil diperbarui!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-nama">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-nip">NIP</Label>
              <Input
                id="edit-nip"
                type="text"
                placeholder="NIP / NIK / ID Pegawai (opsional)"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                disabled={isSubmitting}
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
