import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

import { meQuery } from '../../lib/apollo/withMe'

const mutation = gql`
  mutation authorizeSession(
    $email: String!
    $tokens: [SignInToken!]!
    $consents: [String!]
    $requiredFields: RequiredUserFields
  ) {
    authorizeSession(
      email: $email
      tokens: $tokens
      consents: $consents
      requiredFields: $requiredFields
    )
  }
`

export default graphql(mutation, {
  props: ({ mutate }) => ({
    authorizeSession: (variables) =>
      mutate({
        variables,
        refetchQueries: [{ query: meQuery }],
        awaitRefetchQueries: true,
      }),
  }),
})
