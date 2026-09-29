'use client'

import { useEffect } from 'react'
import { useSetManualTheme } from '@/app/components/theme-provider'

/**
 * Receives the dark-mode toggle from the Sanity Studio preview header and turns
 * it into a manual `forcedTheme` override. The message shape is the shared
 * contract between the two repos; `theme` is `'dark'` or `'light'`.
 * Also handles print requests from the preview header.
 */
export function PreviewThemeListener() {
  const setManual = useSetManualTheme()
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      switch (event.data?.type) {
        case 'republik/preview-theme':
          setManual(event.data.theme)
          break
        case 'republik/preview-print':
          window.print()
          break
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setManual])
  return null
}
