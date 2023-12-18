import { ME_QUERY } from '@app/graphql/republik-api/me.query'
import { MeQuery } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '../apollo/client'

export async function getMe(): Promise<MeQuery['me']> {
  const { data } = await getClient().query({ query: ME_QUERY })
  return data.me
}
