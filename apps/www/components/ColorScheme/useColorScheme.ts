import { useEffect } from 'react'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'
import { useTheme } from './ThemeProvider'

export const COLOR_SCHEME_KEY = 'republik-color-scheme'

export const usePersistedColorSchemeKey = createPersistedState<
  string | undefined
>(COLOR_SCHEME_KEY)

// used to persist os color scheme when running in our Android app
// - our web view on Android currently does not support media query dark mode detection
export const OS_COLOR_SCHEME_KEY = 'republik-os-color-scheme'
export const usePersistedOSColorSchemeKey =
  createPersistedState(OS_COLOR_SCHEME_KEY)

const DEFAULT_KEY = 'auto'

export const useColorSchemePreference = () => {
  const { theme, setTheme } = useTheme()
  const { inNativeApp } = useInNativeApp()
  const currentKey = (theme === 'system' ? 'auto' : theme) || DEFAULT_KEY
  const [legacyKey, setPersistedKey] = usePersistedColorSchemeKey<
    string | undefined
  >(undefined)

  useEffect(() => {
    if (inNativeApp) {
      postMessage({
        type: 'setColorScheme',
        colorSchemeKey: currentKey,
      })
    }
  }, [inNativeApp, currentKey])

  const set = (value: string) => {
    setTheme(value === 'auto' ? 'system' : value)
    setPersistedKey(undefined)
  }

  return [legacyKey, set, DEFAULT_KEY] as const
}
