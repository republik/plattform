import { useEffect } from 'react'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

export const COLOR_SCHEME_KEY = 'republik-color-scheme'

const usePersistedColorSchemeKey =
  createPersistedState<string>(COLOR_SCHEME_KEY)

// used to persist os color scheme when running in our Android app
// - our web view on Android currently does not support media query dark mode detection
export const OS_COLOR_SCHEME_KEY = 'republik-os-color-scheme'
export const usePersistedOSColorSchemeKey =
  createPersistedState(OS_COLOR_SCHEME_KEY)

const DEFAULT_KEY = 'auto'

export const useColorSchemePreference = () => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const inNewApp = inNativeApp && !inNativeAppLegacy
  const [key, set] = usePersistedColorSchemeKey(DEFAULT_KEY)
  const currentKey = key || DEFAULT_KEY

  useEffect(() => {
    if (inNewApp) {
      postMessage({
        type: 'setColorScheme',
        colorSchemeKey: currentKey,
      })
    }
  }, [inNewApp, currentKey])

  return [currentKey, set, DEFAULT_KEY] as const
}
