'use client'

import { useQuery } from '@apollo/client'
import {
  PENDING_APP_SIGN_IN_QUERY,
  PendingAppSignInResult,
} from '@app/graphql/republik-api/app-sign-in'
import useNativeAppEvent from '@app/lib/hooks/useInNativeApp'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Component to redirect the user to the app sign in page with the current URL as the redirect URL.
 * The redirect URL is used to redirect the user back to the page he was on before the
 * app sign in was accepted/denied.
 */
export function AppSignInHandler() {
  const router = useRouter()
  const lastHandledVerificationUrlRef = useRef<string | null>(null)
  const { data, loading, refetch } = useQuery<PendingAppSignInResult>(
    PENDING_APP_SIGN_IN_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  )

  function redirect(verificationUrl: string) {
    const url = new URL(verificationUrl)
    url.searchParams.set('redirect', encodeURIComponent(window.location.href))

    router.replace(url.toString().replace(url.origin, ''))
  }

  // Recheck for a pending app sign in
  // when the native app sends an authorization event.
  useNativeAppEvent('authorization', async () => {
    refetch()
  })

  useEffect(() => {
    if (
      !loading &&
      data?.pendingAppSignIn &&
      data.pendingAppSignIn.verificationUrl !=
        lastHandledVerificationUrlRef.current
    ) {
      lastHandledVerificationUrlRef.current =
        data.pendingAppSignIn.verificationUrl
      redirect(data.pendingAppSignIn.verificationUrl)
    }
  }, [data])

  return null
}
