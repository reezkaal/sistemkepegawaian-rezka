/**
 * ThemeContext — Context object untuk sistem tema (light/dark/system).
 *
 * Dipisah ke file .ts (bukan .tsx) agar tidak trigger Fast Refresh warning:
 * context bukan komponen, tidak boleh bersama komponen atau hook di satu file.
 *
 * Dipakai oleh:
 *   - ThemeProvider.tsx (menyediakan value)
 *   - useTheme.tsx (membaca value lewat useContext)
 */

import { createContext } from 'react'
import type { ThemeMode } from '@/hooks/useTheme'

export type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
