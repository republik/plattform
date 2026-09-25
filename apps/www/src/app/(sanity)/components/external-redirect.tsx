'use client'

import { useEffect } from 'react'

/**
 * Performs a redirect to an external (or app-restricted) target in the
 * browser, since the native app's web view must not navigate there directly.
 * Mirrors the equivalent handling in `components/StatusError`.
 */
export function ExternalRedirect({ target }: { target: string }) {
  useEffect(() => {
    // give matomo some time to register the page view
    const timeoutId = setTimeout(() => {
      window.location.href = target
      setTimeout(() => {
        // reset app to home page once the external target has opened
        window.location.href = '/'
      }, 1000)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [target])

  return null
}
