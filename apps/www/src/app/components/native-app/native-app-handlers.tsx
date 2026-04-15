import { NAAppSignInHandler } from './handlers/app-sign-in-handler'
import { NARoutingHandler } from './handlers/routing-handler'
import { NARegisterDevicePushNotificationHandler } from './handlers/register-device-push-notification-handler'
import { Suspense } from 'react'
import { NAColorSchemeSyncHandler } from './handlers/color-scheme-handler'
import { MeQuery } from '#graphql/republik-api/__generated__/gql/graphql'

type NativeAppHandlersProps = {
  me: MeQuery['me']
}

/**
 * NativeAppHandler is a component that registers the various handlers
 * used to react to native app events. Additionally route & theme changes are sent
 * to the native app.
 */
export function NativeAppHandlers({ me }: NativeAppHandlersProps) {
  return (
    <>
      {/*
      Why is this wrapped in Suspense? check out this documentation:
       src: https://nextjs.org/docs/app/api-reference/functions/use-router#router-events
      */}
      <Suspense fallback={null}>
        <NARoutingHandler />
      </Suspense>
      {me && <NAAppSignInHandler />}
      <NARegisterDevicePushNotificationHandler />
      <NAColorSchemeSyncHandler />
    </>
  )
}
