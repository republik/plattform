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
    $birthyear: Int
    $firstName: String
    $lastName: String
    $phoneNumber: String
    $gender: String
    $address: AddressInput
  ) {
    updateMe(
      birthyear: $birthyear
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      gender: $gender
      address: $address
    ) {
      id
      birthyear
      gender
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
      birthyear
      gender
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
