'use client'

import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from 'next-themes'

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
