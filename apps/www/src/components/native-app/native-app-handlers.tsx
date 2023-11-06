import { MeQueryResult } from '@app/graphql/republik-api/me.query'
import { NAAppSignInHandler } from './handlers/app-sign-in-handler'
import { NARoutingHandler } from './handlers/routing-handler'

type NativeAppHandlersProps = {
  me: MeQueryResult['me']
}

/**
 * NativeAppHandler is a component that registers the various handlers
 * used to react to native app events. Additionally route & theme changes are sent
 * to the native app.
 */
export function NativeAppHandlers({ me }: NativeAppHandlersProps) {
  return (
    <>
      <NARoutingHandler />
      {me && <NAAppSignInHandler />}
    </>
  )
}
