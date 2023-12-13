import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const datatransAuthorize = gql`
  mutation datatransAuthorize($pledgeId: ID!, $sourceId: ID!) {
    datatransAuthorize(pledgeId: $pledgeId, sourceId: $sourceId) {
      paymentId
    }
  }
`

export const withDatatransAuthorize = graphql(datatransAuthorize, {
  props: ({ mutate }) => ({
    datatransAuthorize: (variables) => mutate({ variables }),
  }),
})
