import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FieldErrors {
  username?: string
  password?: string
}

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sudah login -> tidak perlu melihat halaman login lagi.
  // Jika diarahkan kembali dari halaman protected, kembalikan ke sana.
  if (!isLoading && isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!username.trim()) {
      errors.username = 'Username/NIP wajib diisi.'
    }
    if (!password) {
      errors.password = 'Password wajib diisi.'
    }
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const result = await login(username, password)
      if (!result.success) {
        setFormError(result.message ?? 'Login gagal. Silakan coba lagi.')
        return
      }
      navigate('/dashboard', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Identitas instansi */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo-kemenhub.png"
            alt="Logo Kementerian Perhubungan Republik Indonesia"
            className="h-14 w-14 object-contain"
          />
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            SIMPEG PPSDMPU
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem Informasi Kepegawaian
          </p>
        </div>

        {/* Card login */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            {formError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username / NIP</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Masukkan username atau NIP"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                disabled={isSubmitting}
              />
              {fieldErrors.username && (
                <p id="username-error" role="alert" className="text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Akses terbatas untuk pegawai PPSDMPU. Hubungi petugas jika mengalami kendala login.
        </p>
      </div>
    </div>
  )
}
