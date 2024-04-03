'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export { useTheme } from 'next-themes'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemeProvider attribute='data-theme' disableTransitionOnChange>
      {/* <Head>
        <meta name='theme-color' content='var(--color-default)' />
      </Head> */}
      {children}
    </NextThemeProvider>
  )
}
