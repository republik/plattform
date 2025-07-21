'use server'
import { getClient } from '../../../lib/apollo/client'
import { GetUsersDocument } from '../../../graphql/republik-api/__generated__/gql/graphql'

export async function searchUsers(searchString: string) {
  const client = await getClient()
  const { data } = await client.query({ 
    query: GetUsersDocument,
    variables: { search: searchString },
  })
  return data.users
}
