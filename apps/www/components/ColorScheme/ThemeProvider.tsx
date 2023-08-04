import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import { ReactNode, useEffect } from 'react'
import { useColorSchemePreference } from './useColorScheme'
import { useInNativeApp } from '../../lib/withInNativeApp'

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

const AppThemeProvider = () => {
  const { theme } = useTheme()
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const inNewApp = inNativeApp && !inNativeAppLegacy
  const currentKey = (theme === 'system' ? 'auto' : theme) || 'auto'

  useEffect(() => {
    console.log('inNewApp', inNewApp, currentKey)
    if (inNewApp) {
      postMessage({
        type: 'setColorScheme',
        colorSchemeKey: currentKey,
      })
    }
  }, [inNewApp, currentKey])

  return null
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemeProvider attribute='data-theme' disableTransitionOnChange>
      <ColorSchemeMigration />
      <AppThemeProvider />
      {children}
    </NextThemeProvider>
  )
}
