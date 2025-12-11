'use server'

import { DeleteContributorDocument } from '../../../graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '../../../lib/apollo/client'

export const deleteAuthor = async (id: string) => {
  const client = await getClient()
  try {
    const result = await client.mutate({
      mutation: DeleteContributorDocument,
      variables: { id },
    })
    return result.data?.deleteContributor
  } catch (error) {
    return {
      message: 'Ein unerwarteter Fehler ist aufgetreten',
    }
  }
}