'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

export { useTheme } from 'next-themes'

export const ThemeProvider = (
  props: Omit<ThemeProviderProps, 'attribute' | 'disableTransitionChange'>,
) => {
  return (
    <NextThemeProvider
      {...props}
      attribute='data-theme'
      disableTransitionOnChange
    />
  )
}
