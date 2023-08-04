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

  if (typeof window !== 'undefined' && key) {
    const cleanedKey = key.replaceAll('"', '')
    setTheme(cleanedKey === 'auto' ? 'system' : cleanedKey)
    setKey(null)
  }
  return null
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemeProvider attribute='data-theme' disableTransitionOnChange>
      <ColorSchemeMigration />
      {children}
    </NextThemeProvider>
  )
}
