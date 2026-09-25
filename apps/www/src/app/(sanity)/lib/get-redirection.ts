import { gql } from '@apollo/client'
import { headers } from 'next/headers'
import { getClient } from '@/app/lib/apollo/client'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import { getNativeAppVersion } from '@/lib/parse-useragent'

// Duplicated from `components/StatusError` (rather than imported from there)
// since that module is a Client Component pulling in `next/navigation` hooks
// and `withInNativeApp`, which cannot be imported from a Server Component.
const isExternal = (target: string): boolean =>
  !target.startsWith('/') &&
  !target.startsWith(PUBLIC_BASE_URL) &&
  !target.startsWith(PUBLIC_BASE_URL.replace('https://www.', 'https://'))

const REDIRECTION_QUERY = gql`
  query getRedirection($path: String!) {
    redirection(path: $path) {
      target
      status
    }
  }
`

export type RedirectionResult =
  | { type: 'redirect'; target: string; permanent: boolean }
  /**
   * The redirection has to be performed by `ExternalRedirect` in the browser,
   * which opens the target outside of the native app's web view.
   */
  | { type: 'client'; target: string; permanent: boolean }
  | { type: 'none' }

/**
 * Looks up the redirection registered for the given path (as `StatusError`
 * does for the Pages Router). Used by the Sanity catch-all route, whose
 * `notFound()` calls otherwise never consult the backend for redirections.
 */
export async function getRedirection(path: string): Promise<RedirectionResult> {
  const client = await getClient()

  const redirection = await client
    .query({
      query: REDIRECTION_QUERY,
      variables: { path },
    })
    .then(({ data }) => data?.redirection)
    .catch((error) => {
      console.warn(`Failed to look up redirection for "${path}"`, error)
      return undefined
    })

  if (!redirection) {
    return { type: 'none' }
  }

  const { target, status } = redirection
  const requestHeaders = await headers()
  const inNativeApp = !!getNativeAppVersion(requestHeaders.get('user-agent'))
  const isRestrictedAppTarget = /^\/angebote(\?|$)/.test(target)

  if (inNativeApp && (isExternal(target) || isRestrictedAppTarget)) {
    return { type: 'client', target, permanent: status === 301 }
  }

  return { type: 'redirect', target, permanent: status === 301 }
}
