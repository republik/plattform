import { ME_QUERY } from '@app/graphql/republik-api/me.query'
import { getClient } from '../apollo/client'
import { MeQuery } from '@app/graphql/republik-api/gql/graphql'

export type Me = NonNullable<MeQuery['me']>

export async function getMe(): Promise<Me | null> {
  const { data } = await getClient().query({ query: ME_QUERY })

  return data.me
}
