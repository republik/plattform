import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const datatransInit = gql`
  mutation datatransInit($pledgeId: ID!, $method: PaymentMethod!) {
    datatransInit(pledgeId: $pledgeId, method: $method) {
      authorizeUrl
    }
  }
`

export const withDatatransInit = graphql(datatransInit, {
  props: ({ mutate }) => ({
    datatransInit: (variables) => mutate({ variables }),
  }),
})
