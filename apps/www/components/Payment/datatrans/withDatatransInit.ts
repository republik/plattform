import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const datatransInit = gql`
  mutation datatransInit($pledgeId: ID!, $service: DatatransService!) {
    datatransInit(pledgeId: $pledgeId, service: $service) {
      authorizeUrl
    }
  }
`

export const withDatatransInit = graphql(datatransInit, {
  props: ({ mutate }) => ({
    datatransInit: (variables) => mutate({ variables }),
  }),
})
