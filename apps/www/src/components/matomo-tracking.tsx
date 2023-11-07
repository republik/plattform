'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    _paq?: string[][]
  }
}

// See https://nextjs.org/docs/app/api-reference/functions/use-router#router-events

export function MatomoTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      const url = new URL(pathname, window.location.origin)
      url.search = searchParams.toString()

      if (Array.isArray(window._paq)) {
        window._paq.push(['setCustomUrl', url.toString()])
        window._paq.push(['setDocumentTitle', document.title])
        window._paq.push(['trackPageView'])
      }
    } catch (e) {
      console.error(e)
    }
  }, [pathname, searchParams])

  return null
}
