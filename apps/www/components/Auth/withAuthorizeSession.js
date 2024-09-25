import { MeDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

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
        refetchQueries: [{ query: MeDocument }],
        awaitRefetchQueries: true,
      }),
  }),
})
