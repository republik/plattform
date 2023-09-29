import { ME_QUERY } from '@app/graphql/republik-api/me.query'
import { getClient } from '../apollo/client'

export async function getMe() {
  const { data } = await getClient().query({ query: ME_QUERY })

  return data.me
}
