import { useState } from 'react'
import { UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
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
import { createUser } from '@/services/userManagement'
import type { UserRole } from '@/types/auth'

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  email: string
  password: string
  nama: string
  nip: string
  role: UserRole
}

const INITIAL_FORM: FormData = {
  email: '',
  password: '',
  nama: '',
  nip: '',
  role: 'user',
}

export default function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const { role: callerRole } = useAuth()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setShowPassword(false)
    setError(null)
    setSuccess(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validasi client-side
    if (!form.email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (!form.email.includes('@')) {
      setError('Format email tidak valid.')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (!form.nama.trim()) {
      setError('Nama lengkap wajib diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        nama: form.nama.trim(),
        nip: form.nip.trim() || undefined,
        role: form.role,
      })
      setSuccess(true)
      onSuccess()
      // Auto-close setelah 1.5 detik
      setTimeout(() => {
        handleOpenChange(false)
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pengguna.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Role options berdasarkan role caller
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Buat akun pengguna baru untuk sistem SIMPEG.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">Pengguna berhasil dibuat!</p>
            <p className="text-xs text-muted-foreground">
              {form.nama} ({form.email})
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="add-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-email"
                type="email"
                placeholder="contoh@ppsdmpu.go.id"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="add-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <Label htmlFor="add-nama">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-nama"
                type="text"
                placeholder="Nama lengkap pengguna"
                value={form.nama}
                onChange={(e) => handleChange('nama', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* NIP */}
            <div className="space-y-1.5">
              <Label htmlFor="add-nip">NIP</Label>
              <Input
                id="add-nip"
                type="text"
                placeholder="Opsional - NIP / NIK / ID Pegawai"
                value={form.nip}
                onChange={(e) => handleChange('nip', e.target.value)}
                disabled={isSubmitting}
                maxLength={30}
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="add-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                id="add-role"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
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
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Membuat...' : 'Tambah Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

