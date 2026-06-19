import { createContext, useContext } from 'react'
import { themes, type ThemeId } from './themes'

export const THEME_STORAGE_KEY = 'monster-command-theme'

export type TcgThemeContextValue = {
  themeId: ThemeId
  setThemeId: (themeId: ThemeId) => void
  themeOptions: typeof themes
}

export const TcgThemeContext = createContext<TcgThemeContextValue | null>(null)

export function useTcgTheme() {
  const context = useContext(TcgThemeContext)

  if (!context) {
    throw new Error('useTcgTheme must be used within a TcgThemeProvider')
  }

  return context
}
