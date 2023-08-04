import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import { ReactNode } from 'react'
import { useColorSchemePreference } from './useColorScheme'

export { useTheme } from 'next-themes'

/**
 * This component is used to migrate the old color scheme key to the new one.
 * managed by next-themes.
 */
const ColorSchemeMigration = () => {
  const [key, setKey] = useColorSchemePreference()

  if (typeof window !== 'undefined' && key) {
    const cleanedKey = key.replaceAll('"', '')
    setKey(cleanedKey)
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
