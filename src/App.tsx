import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Employees from '@/pages/Employees'
import EmployeeDetail from '@/pages/EmployeeDetail'
import Leave from '@/pages/Leave'
import Persuratan from '@/pages/Persuratan'
import UserManagement from '@/pages/UserManagement'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Rute Terproteksi: Semua pengguna login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cuti" element={<Leave />} />
              <Route path="/pegawai/:nip" element={<EmployeeDetail />} />

              {/* Rute Khusus Superadmin & Admin Kepegawaian */}
              <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
                <Route path="/pegawai" element={<Employees />} />
                <Route path="/persuratan" element={<Persuratan />} />
                <Route path="/kelola-pengguna" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
