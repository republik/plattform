'use client'

import { DEFAULT_FONT_SIZE, isValidFontSize } from '@/app/lib/font-size'
import { useFontSize } from '@/lib/fontSize'
import { writeFontSizeCookie } from '@/lib/fontSizeCookie'
import { useEffect } from 'react'

/**
 * Keeps the document root in sync with the reader's font size.
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

    document.documentElement.style.fontSize = `${fontSize}px`
    writeFontSizeCookie(fontSize)

    return () => {
      // Scoped to the reading views, like the Pages Router's FontSize/Sync —
      // leaving the root scaled would follow the reader onto every other page.
      document.documentElement.style.fontSize = ''
    }
  }, [fontSize])

  return null
}
