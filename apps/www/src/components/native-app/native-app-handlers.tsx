import { ME_QUERY, MeQueryResult } from '@app/graphql/republik-api/me.query'
import { AppSignInHandler } from './handlers/app-sign-in-handler'
import { useQuery } from '@apollo/client'

/**
 * NativeAppHandler is a component that registers the various handlers
 * used to react to native app events. Additionally route & theme changes are sent
 * to the native app.
 */
export function NativeAppHandlers(): JSX.Element | null {
  const { data: { me } = { me: null } } = useQuery<MeQueryResult>(ME_QUERY)

  return <>{me && <AppSignInHandler />}</>
}
