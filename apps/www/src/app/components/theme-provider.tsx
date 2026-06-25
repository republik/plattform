'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

export { useTheme } from 'next-themes'

const ForceThemeCtx = createContext<(t: 'dark' | 'light' | undefined) => void>(
  () => {},
)

export function useForceTheme(theme: 'dark' | 'light' | undefined) {
  const setForced = useContext(ForceThemeCtx)
  useEffect(() => {
    setForced(theme)
    return () => setForced(undefined)
  }, [theme, setForced])
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [forced, setForced] = useState<'dark' | 'light' | undefined>()
  return (
    <ForceThemeCtx.Provider value={setForced}>
      <NextThemeProvider
        attribute='data-theme'
        disableTransitionOnChange
        forcedTheme={forced}
      >
        {/* <Head>
        <meta name='theme-color' content='var(--color-default)' />
      </Head> */}
        {children}
      </NextThemeProvider>
    </ForceThemeCtx.Provider>
  )
}
