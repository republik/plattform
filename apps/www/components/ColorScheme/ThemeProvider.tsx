import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { useColorSchemePreference } from './useColorScheme'
import Head from 'next/head'

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
      <Head>
        <meta name='theme-color' content='var(--color-default)' />
      </Head>
      {children}
    </NextThemeProvider>
  )
}
