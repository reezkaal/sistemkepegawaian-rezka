/**
 * ThemeProvider — Context provider untuk light/dark/system theme.
 *
 * ThemeContext dan ThemeContextValue didefinisikan di themeContext.ts
 * (file terpisah tanpa JSX) agar file ini hanya mengekspor komponen
 * React — syarat Fast Refresh.
 *
 * Import useTheme dan ThemeMode dari '@/hooks/useTheme'.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext } from '@/hooks/themeContext'
import type { ThemeMode } from '@/hooks/useTheme'

const STORAGE_KEY = 'ppsdmpu_theme'

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage tidak tersedia — fallback ke system
  }
  return 'system'
}

function applyThemeClass(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme())
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => getSystemPrefersDark())

  // Pantau perubahan preferensi sistem (hanya relevan saat theme === 'system')
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = (next: ThemeMode) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage tidak tersedia — preferensi tidak akan bertahan, tidak fatal
    }
  }

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
