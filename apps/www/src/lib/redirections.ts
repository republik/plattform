import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client'
import { GetServerSidePropsContext, Redirect } from 'next'
import { isExternal } from '@/components/StatusError'
import { getNativeAppVersion } from './parse-useragent'

const REDIRECTION_QUERY = gql`
  query getRedirection($path: String!) {
    redirection(path: $path) {
      id
      target
      status
    }
  }
`

export type RedirectionResult =
  | { type: 'redirect'; redirect: Redirect }
  /**
   * The redirection has to be performed by `StatusError` in the browser, which
   * opens the target outside of the native app's web view.
   */
  | { type: 'client' }
  | { type: 'none' }

const appendQueryString = (target: string, queryString?: string): string =>
  queryString
    ? `${target}${target.includes('?') ? '&' : '?'}${queryString}`
    : target

/**
 * Looks up the redirection registered for the requested path and turns it into a
 * `getServerSideProps` redirect.
 *
 * This mirrors `components/StatusError`, which runs the same lookup in the
 * browser whenever a page renders a 404: the query string of the current request
 * is forwarded to the target (utm parameters, dashboard params), and inside the
 * native app external targets and the `/angebote` paywall are left to the
 * client, since those must not be opened in the app's web view.
 *
 * Unlike `StatusError` the lookup uses the pathname only — it queries before a
 * 404 is rendered, so there is no cached result to reuse, and registered
 * redirections are keyed by path.
 */
export async function getServerSideRedirection(
  client: ApolloClient<NormalizedCacheObject>,
  ctx: GetServerSidePropsContext,
): Promise<RedirectionResult> {
  const [path, queryString] = ctx.resolvedUrl.split('?')

  const redirection = await client
    .query({
      query: REDIRECTION_QUERY,
      variables: { path },
    })
    .then(({ data }) => data?.redirection)
    .catch((error) => {
      // Matches the client-side behaviour, which ignores a failed lookup and
      // renders the 404 instead
      console.warn(`Failed to look up redirection for "${path}"`, error)
      return undefined
    })

  if (!redirection) {
    return { type: 'none' }
  }

  const { target, status } = redirection
  const inNativeApp = !!getNativeAppVersion(ctx.req.headers['user-agent'])
  const isRestrictedAppTarget = /^\/angebote(\?|$)/.test(target)

  if (inNativeApp && (isExternal(target) || isRestrictedAppTarget)) {
    return { type: 'client' }
  }

  return {
    type: 'redirect',
    redirect: {
      destination: appendQueryString(target, queryString),
      permanent: status === 301,
    },
  }
}
