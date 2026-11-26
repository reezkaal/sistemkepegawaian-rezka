import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Plane, TriangleAlert, User } from 'lucide-react'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Latar belakang: pola blueprint dot-grid + cahaya atmosfer + jalur penerbangan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-foreground/[0.06] dark:text-foreground/[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15"
      />

      {/* Garis lintasan penerbangan (Aviation Blueprint Arcs) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-primary/15 dark:text-primary/20"
      >
        <path
          d="M-80 680 Q 420 220 1520 340"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="6 8"
        />
        <path
          d="M-40 780 Q 560 360 1480 540"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <circle cx="290" cy="430" r="3.5" fill="currentColor" />
        <circle cx="1140" cy="312" r="3.5" fill="currentColor" />
      </svg>

      {/* Tombol ganti tema di pojok kanan atas */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Identitas instansi */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-card/85 p-2.5 shadow-sm backdrop-blur-md">
            <img
              src="/logo-kemenhub.png"
              alt="Logo Kementerian Perhubungan Republik Indonesia"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[11px] font-medium text-primary">
            <Plane className="h-3 w-3" aria-hidden="true" />
            Portal Kepegawaian PPSDMPU
          </span>
          <h1 className="mt-2.5 text-xl font-bold tracking-tight text-foreground">
            SIMPEG PPSDMPU
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Pusat Pengembangan SDM Perhubungan Udara
          </p>
        </div>

        {/* Card login (Glassmorphism halus + pita aksen Kemenhub) */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-xl backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="h-1 w-full bg-gradient-to-r from-primary via-sky-500 to-amber-500"
          />
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate>
              {formError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Email / Username / NIP</Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                    className="h-10 pl-9"
                  />
                </div>
                {fieldErrors.username && (
                  <p id="username-error" role="alert" className="text-sm text-destructive">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                    className="h-10 pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

              <Button
                type="submit"
                className="mt-6 h-10 w-full font-semibold shadow-sm transition-all hover:shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </div>
        </div>

        {!isConfigured && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-center text-xs text-amber-500 backdrop-blur-sm">
            <p className="font-semibold">Mode Simulasi (Mock)</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Supabase belum dikonfigurasi di <code className="text-foreground">.env</code>. Akun tes per role:
              <br />
              • <b>superadmin</b> (pass: <code className="text-foreground">admin123</code>)
              <br />
              • <b>admin</b> (pass: <code className="text-foreground">admin123</code>)
              <br />
              • <b>198001012005011001</b> (pass: <code className="text-foreground">password123</code>)
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Akses terbatas untuk pegawai PPSDMPU. Hubungi petugas jika mengalami kendala login.
        </p>
      </div>
    </div>
  )
}
