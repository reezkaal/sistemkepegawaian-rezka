import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Melindungi /dashboard, /pegawai, /cuti dari akses tanpa login (§ 7).
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Selama status auth masih dicek dari sessionStorage (sinkron & cepat,
  // tapi tetap kita jaga agar tidak "flash" ke /login sebelum siap).
  if (isLoading) return null

  if (!isAuthenticated) {
    // Simpan asal halaman agar setelah login user diarahkan kembali ke sana.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
