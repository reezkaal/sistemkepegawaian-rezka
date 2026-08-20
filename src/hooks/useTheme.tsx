/**
 * useTheme — hook untuk membaca dan mengubah tema (light/dark/system).
 *
 * ThemeProvider → ThemeProvider.tsx (hanya komponen)
 * ThemeContext  → themeContext.ts   (hanya context)
 * useTheme      → useTheme.tsx      (hanya hook + type) ← file ini
 *
 * Penggunaan:
 *   const { theme, resolvedTheme, setTheme } = useTheme()
 *
 * Pastikan komponen berada di dalam <ThemeProvider> (lihat main.tsx).
 */

import { useContext } from 'react'
import { ThemeContext } from '@/hooks/themeContext'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme harus dipakai di dalam <ThemeProvider>')
  }
  return ctx
}
