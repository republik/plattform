'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type AppSignInViewProps = {
  verificationURL: string
}

/**
 * Component to redirect the user to the app sign in page with the current URL as the redirect URL.
 * The redirect URL is used to redirect the user back to the page he was on before the
 * app sign in was accepted/denied.
 */
export function AppSignInRedirect({ verificationURL }: AppSignInViewProps) {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(verificationURL)
    url.searchParams.set('redirect', encodeURIComponent(window.location.href))

    router.replace(url.toString().replace(url.origin, ''))
  }, [verificationURL, router.push])

  return null
}
