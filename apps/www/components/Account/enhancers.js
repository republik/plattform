import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

export const newsletterFragment = `
  fragment NewsletterInfo on NewsletterSubscription {
    id
    name
    subscribed
  }
`

export const userDetailsFragment = `
  fragment PhoneAndAddressOnUser on User {
    id
    phoneNumber
    address {
      name
      line1
      line2
      postalCode
      city
      country
    }
  }
`

const mutation = gql`
  mutation updateMe(
    $birthday: Date
    $firstName: String
    $lastName: String
    $phoneNumber: String
    $address: AddressInput
  ) {
    updateMe(
      birthday: $birthday
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      address: $address
    ) {
      id
      birthday
      name
      firstName
      lastName
      ...PhoneAndAddressOnUser
    }
  }
  ${userDetailsFragment}
`

const addMeToRole = gql`
  mutation addUserToRole($role: String!) {
    addUserToRole(role: $role) {
      id
      roles
      newsletterSettings {
        id
        status
        subscriptions {
          ...NewsletterInfo
        }
      }
    }
  }
  ${newsletterFragment}
`

export const query = gql`
  query myAddress {
    me {
      id
      name
      firstName
      lastName
      email
      birthday
      ...PhoneAndAddressOnUser
    }
  }
  ${userDetailsFragment}
`

export const withMyDetails = graphql(query, {
  name: 'detailsData',
})

export const withMyDetailsMutation = graphql(mutation, {
  props: ({ mutate }) => ({
    updateDetails: (variables) =>
      mutate({
        variables,
      }),
  }),
})

export const withAddMeToRole = graphql(addMeToRole, {
  props: ({ mutate }) => ({
    addMeToRole: (variables) =>
      mutate({
        variables,
      }),
  }),
})
