import {
  MantineProvider,
  createTheme,
  type CSSVariablesResolver,
} from '@mantine/core'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TcgThemeContext, THEME_STORAGE_KEY } from './themeContext'
import { defaultThemeId, isThemeId, themes, type ThemeId } from './themes'

function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined') {
    return defaultThemeId
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeId(storedTheme) ? storedTheme : defaultThemeId
}

type TcgThemeProviderProps = {
  children: ReactNode
}

export function TcgThemeProvider({ children }: TcgThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialTheme)
  const activeTheme = themes[themeId]

  const mantineTheme = useMemo(
    () =>
      createTheme({
        primaryColor: 'brand',
        colors: {
          brand: activeTheme.brand,
        },
        defaultRadius: 'sm',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headings: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }),
    [activeTheme],
  )

  const cssVariablesResolver = useMemo<CSSVariablesResolver>(
    () => () => ({
      variables: activeTheme.tokens,
      light: {},
      dark: {},
    }),
    [activeTheme],
  )

  useEffect(() => {
    document.documentElement.dataset.tcgTheme = themeId
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }, [themeId])

  const contextValue = useMemo(
    () => ({
      themeId,
      setThemeId,
      themeOptions: themes,
    }),
    [themeId],
  )

  return (
    <TcgThemeContext.Provider value={contextValue}>
      <MantineProvider
        theme={mantineTheme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="dark"
      >
        {children}
      </MantineProvider>
    </TcgThemeContext.Provider>
  )
}
