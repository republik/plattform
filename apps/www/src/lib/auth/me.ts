import { ME_QUERY, MeQueryResult } from '@app/graphql/republik-api/me.query'
import { getClient } from '../apollo/client'

export async function getMe(): Promise<MeQueryResult['me']> {
  const { data } = await getClient().query<MeQueryResult>({ query: ME_QUERY })

  return data.me
}
