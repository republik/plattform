'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export { useTheme } from 'next-themes'

type Theme = 'dark' | 'light' | undefined

// Two force sources with fixed precedence: an explicit `manual` toggle (the
// Sanity preview dark-mode button) wins over a `content` force (an article/page
// whose theme.darkMode is set) — see `forcedTheme` below.
type ForceSource = 'content' | 'manual'

const ForceThemeCtx = createContext<(source: ForceSource, theme: Theme) => void>(
  () => {},
)

export function useForceTheme(theme: Theme) {
  const setForce = useContext(ForceThemeCtx)
  useEffect(() => {
    setForce('content', theme)
    return () => setForce('content', undefined)
  }, [theme, setForce])
}

export const useSetManualTheme = () => {
  const setForce = useContext(ForceThemeCtx)
  return useCallback((theme: Theme) => setForce('manual', theme), [setForce])
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [forced, setForced] = useState<Record<ForceSource, Theme>>({
    content: undefined,
    manual: undefined,
  })
  const setForce = useCallback(
    (source: ForceSource, theme: Theme) =>
      setForced((prev) => ({ ...prev, [source]: theme })),
    [],
  )
  return (
    <ForceThemeCtx.Provider value={setForce}>
      <NextThemeProvider
        attribute='data-theme'
        disableTransitionOnChange
        forcedTheme={forced.manual ?? forced.content}
      >
        {/* <Head>
        <meta name='theme-color' content='var(--color-default)' />
      </Head> */}
        {children}
      </NextThemeProvider>
    </ForceThemeCtx.Provider>
  )
}
