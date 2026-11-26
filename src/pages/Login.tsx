import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, TriangleAlert, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeToggle from '@/components/layout/ThemeToggle'

interface FieldErrors {
  username?: string
  password?: string
}

export default function Login() {
  const { isAuthenticated, isLoading, login, isConfigured } = useAuth()
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
    <div className="app-canvas relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Cahaya aurora atmosferik halus (tanpa dot-grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 45% at 20% 10%, hsl(var(--primary) / 0.14), transparent 65%), ' +
            'radial-gradient(ellipse 55% 45% at 85% 90%, hsl(var(--cyan) / 0.12), transparent 65%)',
        }}
      />

      {/* Garis orbit tipis latar belakang */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 1000"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[920px] w-[920px] -translate-x-1/2 -translate-y-1/2 text-primary/[0.07] dark:text-sky-300/[0.07]"
      >
        <circle cx="500" cy="500" r="280" stroke="currentColor" strokeWidth="1" />
        <circle cx="500" cy="500" r="390" stroke="currentColor" strokeWidth="1" />
        <circle cx="500" cy="500" r="490" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Tombol ganti tema di pojok kanan atas */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Kontainer utama terpusat */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Identitas instansi (tanpa pill bulat) */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-2.5 shadow-card backdrop-blur-md">
            <img
              src="/logo-kemenhub.png"
              alt="Logo Kementerian Perhubungan Republik Indonesia"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Kementerian Perhubungan RI
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            SIMPEG PPSDMPU
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Pusat Pengembangan SDM Perhubungan Udara
          </p>
        </div>

        {/* Kartu Login (tanpa pita gradasi warna-warni di atas) */}
        <div className="rounded-2xl border border-border/85 bg-card/90 p-6 shadow-popover backdrop-blur-xl dark:bg-card/80 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Masuk ke Akun
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Gunakan email, username, atau NIP Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email / Username / NIP
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan email, username, atau NIP"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl border-border/90 bg-background/70 pl-10 transition-colors focus-visible:bg-background"
                />
              </div>
              {fieldErrors.username && (
                <p id="username-error" role="alert" className="text-xs font-medium text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
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
                  className="h-11 rounded-xl border-border/90 bg-background/70 pl-10 pr-11 transition-colors focus-visible:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <p id="password-error" role="alert" className="text-xs font-medium text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>

        {!isConfigured && (
          <div className="mt-4 rounded-xl border border-amber/30 bg-amber/10 p-3.5 text-center text-xs text-amber backdrop-blur-sm">
            <p className="font-semibold">Mode Simulasi (Mock)</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Supabase belum dikonfigurasi di <code className="text-foreground">.env</code>. Akun tes:
              <br />
              <b>superadmin</b> / <b>admin</b> (pass: <code className="text-foreground">admin123</code>)
              <br />
              <b>198001012005011001</b> (pass: <code className="text-foreground">password123</code>)
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Akses terbatas untuk pegawai PPSDMPU. Hubungi petugas apabila mengalami kendala login.
        </p>
      </div>
    </div>
  )
}
