import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const initDatatrans = gql`
  mutation datatransInit($pledgeId: String!, $service: DatatransService!) {
    datatransInit(pledgeId: $pledgeId, service: $service) {
      authorizeUrl
    }
  }
`

export const withDatatransInit = graphql(initDatatrans, {
  props: ({ mutate }) => ({
    datatransInit: (variables) => mutate({ variables }),
  }),
})
