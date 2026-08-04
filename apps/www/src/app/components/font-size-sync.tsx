'use client'

import {
  DEFAULT_FONT_SIZE,
  fontSizeScale,
  isValidFontSize,
} from '@/app/lib/font-size'
import { useFontSize } from '@/lib/fontSize'
import { writeFontSizeCookie } from '@/lib/fontSizeCookie'
import { useEffect } from 'react'

/**
 * Keeps `--reader-font-scale` on the document root in sync with the reader's
 * font size — the client-side counterpart of `FontSizeStyle`. Only the
 * `editorialContent` recipe consumes the property, so the setting scales
 * article body text and nothing else.
 *
 * localStorage remains the source of truth — the Pages Router reads it directly
 * and `usePersistedState` broadcasts changes across instances and tabs, so the
 * font-size dialog reaches this component with no extra wiring.
 *
 * `useFontSize` mirrors the cookie on every write, so the reconcile below only
 * matters for readers who set a size before that cookie existed: without it
 * their stored size would never reach the server.
 */
export function FontSizeSync() {
  const [fontSize] = useFontSize(DEFAULT_FONT_SIZE)

  useEffect(() => {
    if (!isValidFontSize(fontSize)) {
      return
    }

    document.documentElement.style.setProperty(
      '--reader-font-scale',
      `${fontSizeScale(fontSize)}`,
    )
    writeFontSizeCookie(fontSize)

    return () => {
      // Scoped to the reading views, like the Pages Router's FontSize/Sync —
      // leaving the property set would follow the reader onto every other page.
      document.documentElement.style.removeProperty('--reader-font-scale')
    }
  }, [fontSize])

  return null
}
