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

// A manual theme override, separate from the content-driven force above. Used by
// the Sanity preview dark-mode toggle. It takes precedence over the content
// force (`manual ?? forced`), so an editor's explicit toggle wins.
const ManualThemeCtx = createContext<
  (t: 'dark' | 'light' | undefined) => void
>(() => {})

export function useForceTheme(theme: 'dark' | 'light' | undefined) {
  const setForced = useContext(ForceThemeCtx)
  useEffect(() => {
    setForced(theme)
    return () => setForced(undefined)
  }, [theme, setForced])
}

export const useSetManualTheme = () => useContext(ManualThemeCtx)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [forced, setForced] = useState<'dark' | 'light' | undefined>()
  const [manual, setManual] = useState<'dark' | 'light' | undefined>()
  return (
    <ForceThemeCtx.Provider value={setForced}>
      <ManualThemeCtx.Provider value={setManual}>
        <NextThemeProvider
          attribute='data-theme'
          disableTransitionOnChange
          forcedTheme={manual ?? forced}
        >
          {/* <Head>
        <meta name='theme-color' content='var(--color-default)' />
      </Head> */}
          {children}
        </NextThemeProvider>
      </ManualThemeCtx.Provider>
    </ForceThemeCtx.Provider>
  )
}
