import {
  MeDocument,
  MeQuery,
} from '@graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '../apollo/client'

export async function getMe(): Promise<MeQuery['me']> {
  const { data } = await getClient().query({ query: MeDocument })
  return data.me
}
