import { gql } from '@/graphql/__generated__'
import { MeQuery } from '@/graphql/__generated__/graphql'
import { useQuery } from '@apollo/client'

const ME_QUERY = gql(/* GraphQL */ `
  query me {
    me {
      id
      name
      firstName
      lastName
      email
      roles
    }
  }
`)

export const useMe = (): { me: MeQuery['me'] } => {
  const { data } = useQuery(ME_QUERY)

  return { me: data?.me }
}
