import { useCallback } from 'react'
import { FONT_SIZE_KEY, writeFontSizeCookie } from './fontSizeCookie'
import createPersistedState from './hooks/use-persisted-state'

// Re-exported for the Pages-Router callers that import it from here.
export { FONT_SIZE_KEY }

const usePersistedFontSize = createPersistedState(FONT_SIZE_KEY)

/**
 * Both routers write the font size through this hook — the Pages-Router overlay
 * and the App-Router dialog — so mirroring the cookie in the setter is what
 * keeps the two in step. Without it, a size changed on a legacy page left the
 * cookie stale and the next Sanity article server-rendered the wrong size.
 */
export const useFontSize = (initialState) => {
  const [fontSize, setFontSize] = usePersistedFontSize(initialState)

  const setFontSizeAndMirror = useCallback(
    (next) => {
      setFontSize(next)
      writeFontSizeCookie(next)
    },
    [setFontSize],
  )

  return [fontSize, setFontSizeAndMirror]
}
