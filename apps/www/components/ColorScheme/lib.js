import { useEffect } from 'react'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'
import { useMediaQuery } from '@project-r/styleguide'

export const COLOR_SCHEME_KEY = 'republik-color-scheme'
const usePersistedColorSchemeKey = createPersistedState(COLOR_SCHEME_KEY)

// used to persist os color scheme when running in our Android app
// - our web view on Android currently does not support media query dark mode detection
export const OS_COLOR_SCHEME_KEY = 'republik-os-color-scheme'
export const usePersistedOSColorSchemeKey =
  createPersistedState(OS_COLOR_SCHEME_KEY)

const defaultKey = 'auto'

export const useColorSchemeKeyPreference = () => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const inNewApp = inNativeApp && !inNativeAppLegacy
  const [key, set] = usePersistedColorSchemeKey()
  const currentKey = key || defaultKey

  useEffect(() => {
    if (inNewApp) {
      postMessage({
        type: 'setColorScheme',
        colorSchemeKey: currentKey,
      })
    }
  }, [inNewApp, currentKey])

  return [currentKey, set, defaultKey]
}

export const useColorSchemeKey = () => {
  const [colorSchemeKey, _, defaultKey] = useColorSchemeKeyPreference()
  const [osColorSchemeKey] = usePersistedOSColorSchemeKey()

  return {
    // used for our Android app, see usePersistedOSColorSchemeKey
    key:
      colorSchemeKey === 'auto' && osColorSchemeKey
        ? osColorSchemeKey
        : colorSchemeKey,
    defaultKey,
  }
}

export const useResolvedColorSchemeKey = () => {
  const { key } = useColorSchemeKey()
  const mqDark = useMediaQuery('(prefers-color-scheme: dark)')
  return key === 'auto' ? (mqDark ? 'dark' : 'light') : key
}
