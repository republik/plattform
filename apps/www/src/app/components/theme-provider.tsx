'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { createContext, ReactNode, useContext, useState } from 'react'

export { useTheme } from 'next-themes'

type Theme = 'dark' | 'light' | undefined

// Runtime theme override for the Sanity preview dark-mode toggle: the Studio
// posts a message that `preview-theme-listener` turns into `forcedTheme`.
//
// Content-driven dark mode (`theme.darkMode` on an article/page) is not handled
// here — the page renders a `data-force-theme="dark"` marker matched by the
// `dark` Panda condition (see `preset-republik.ts`).
const ForceThemeCtx = createContext<(theme: Theme) => void>(() => {})

export const useSetManualTheme = () => useContext(ForceThemeCtx)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [forced, setForced] = useState<Theme>(undefined)
  return (
    <ForceThemeCtx.Provider value={setForced}>
      <NextThemeProvider
        attribute='data-theme'
        disableTransitionOnChange
        forcedTheme={forced}
      >
        {children}
      </NextThemeProvider>
    </ForceThemeCtx.Provider>
  )
}
