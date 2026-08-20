import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

// Layout bersama untuk semua halaman protected (/dashboard, /pegawai, /cuti).
// Desktop: sidebar tetap terlihat di kiri (sticky — tidak ikut scroll konten
// utama). Mobile: sidebar jadi overlay yang dibuka lewat tombol menu di Header.
// Teknik: wrapper luar h-screen + flex-col; area bawah header flex-1 overflow-hidden;
// hanya <main> yang overflow-y-auto sehingga scroll hanya terjadi di konten utama.
export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header — tidak scroll, selalu di atas */}
      <Header onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop — sticky, hanya scroll sendiri jika kontennya panjang */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-card lg:block">
          <Sidebar />
        </aside>

        {/* Sidebar mobile (overlay) */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu navigasi"
              className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
              onClick={() => setMobileNavOpen(false)}
            />
            <div
              className={cn(
                'absolute inset-y-0 left-0 w-64 border-r border-border bg-card shadow-popover',
              )}
            >
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Konten utama — satu-satunya area yang scroll */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

