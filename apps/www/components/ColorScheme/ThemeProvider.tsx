import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import { ReactNode } from 'react'
import { usePersistedColorSchemeKey } from './useColorScheme'

export { useTheme } from 'next-themes'

/**
 * This component is used to migrate the old color scheme key to the new one.
 * managed by next-themes.
 */
const ColorSchemeMigration = () => {
  const { setTheme } = useTheme()
  const [key, setKey] = usePersistedColorSchemeKey<string>(null)

  if (typeof window !== 'undefined' && key == 'auto') {
    alert('theme')
    setTheme('system')
    setKey(null)
  }
  return null
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // If set, the theme is forced on next-themes' Provider to bypass its internal localStorage-only implementation

  return (
    <NextThemeProvider
      // storageKey={COLOR_SCHEME_KEY}
      attribute='data-theme'
      disableTransitionOnChange
    >
      <ColorSchemeMigration />
      {children}
    </NextThemeProvider>
  )
}
