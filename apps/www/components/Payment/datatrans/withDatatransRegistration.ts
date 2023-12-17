import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const datatransRegistration = gql`
  mutation datatransRegistration($method: PaymentMethod!, $companyId: ID!) {
    datatransRegistration(method: $method, companyId: $companyId) {
      registrationUrl
    }
  }
`

export const withDatatransRegistration = graphql(datatransRegistration, {
  props: ({ mutate }) => ({
    datatransRegistration: (variables) => mutate({ variables }),
  }),
})
