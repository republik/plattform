'use client'

import { useQuery } from '@apollo/client'
import {
  PENDING_APP_SIGN_IN_QUERY,
  PendingAppSignInResult,
} from '@app/graphql/republik-api/app-sign-in'
import useNativeAppEvent from '@app/lib/hooks/useInNativeApp'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

const AppStateMessageDataSchema = z.object({
  current: z.string(),
  type: z.string(),
})

/**
 * Component that registers the native app handlers
 * for the app sign in flow.
 * When a pending app sign in is detected, the user is redirected to
 * the '/mitteilung?…' where the user can confirm/reject the sign in.
 * After the user has confirmed/rejected the sign in, the native app
 *
 * Handled native app events:
 * - the native app sends an authorization event:
 *  - the peding-app-sign-in query is refetched
 * - the native app sends an appState event === 'active':
 *  - the peding-app-sign-in query is refetched
 */
export function NAAppSignInHandler() {
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

  useNativeAppEvent<unknown>('authorization', async () => {
    refetch()
  })

  useNativeAppEvent<Record<string, unknown> | null>(
    'appState',
    async (content) => {
      if (
        AppStateMessageDataSchema.safeParse(content).success &&
        content?.current === 'active'
      ) {
        refetch()
      }
    },
  )

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
