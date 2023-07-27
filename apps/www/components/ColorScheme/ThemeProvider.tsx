import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { useColorSchemePreference } from './useColorScheme'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // This uses our custom storage implementation which can store the preference in native apps too.
  const [key] = useColorSchemePreference()

  // If set, the theme is forced on next-themes' Provider to bypass its internal localStorage-only implementation
  const forcedTheme = key === 'auto' ? null : key

  return (
    <NextThemeProvider
      attribute='class'
      forcedTheme={forcedTheme}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}
