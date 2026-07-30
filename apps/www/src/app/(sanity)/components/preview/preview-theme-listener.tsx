'use client'

import { useEffect } from 'react'
import { useSetManualTheme } from '@/app/components/theme-provider'

/**
 * Receives the dark-mode toggle from the Sanity Studio preview header and turns
 * it into a manual `forcedTheme` override. The message shape is the shared
 * contract between the two repos; `theme` is `'dark'` or `'light'`.
 */
export function PreviewThemeListener() {
  const setManual = useSetManualTheme()
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      if (event.data?.type === 'republik/preview-theme') {
        setManual(event.data.theme)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setManual])
  return null
}
