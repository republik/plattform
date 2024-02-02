import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const addDatatransSource = gql`
  mutation addDatatransSource($paymentSourceId: String!) {
    addPaymentSource(sourceId: $paymentSourceId, pspPayload: {}) {
      id
    }
  }
`

export const withAddDatatransSource = graphql(addDatatransSource, {
  props: ({ mutate }) => ({
    addDatatransSource: (variables) => mutate({ variables }),
  }),
})
