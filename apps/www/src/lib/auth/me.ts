import {
  MeDocument,
  MeQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '../apollo/client'

export async function getMe(): Promise<{
  me: MeQuery['me']
  isMember: boolean
  hasActiveMembership: boolean
}> {
  const client = await getClient()
  const { data } = await client.query({ query: MeDocument })
  return {
    me: data?.me,
    isMember: data?.me?.roles.some((role) => role === 'member'),
    hasActiveMembership:
      !!data?.me?.activeMembership || !!data?.me?.activeMagazineSubscription,
  }
}
