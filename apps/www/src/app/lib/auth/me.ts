import {
  MeDocument,
  MeQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { cache } from 'react'
import { getClient } from '../apollo/client'

/**
 * Deduped per request: the layout and individual routes both need this, and
 * without `cache()` the dedup would rest on Apollo's default `cache-first`
 * policy and quietly break if a `fetchPolicy` were ever configured.
 */
export const getMe = cache(
  async (): Promise<{
    me: MeQuery['me']
    isMember: boolean
    hasActiveMembership: boolean
  }> => {
    const client = await getClient()
    const { data } = await client.query({ query: MeDocument })
    return {
      me: data?.me,
      isMember: data?.me?.roles.some((role) => role === 'member'),
      hasActiveMembership:
        !!data?.me?.activeMembership || !!data?.me?.activeMagazineSubscription,
    }
  },
)
