import { gql } from '@apollo/client'

export const SIGN_UP_FOR_NEWSLETTER_MUTATION = gql`
  mutation SignUpForNewsletter(
    $email: String!
    $name: NewsletterName!
    $context: String!
  ) {
    requestNewsletterSubscription(email: $email, name: $name, context: $context)
  }
`

export type SignUpForNewsletterResult = {
  requestNewsletterSubscription: boolean
}

export type SignUpForNewsletterVariables = {
  email: string
  name: string
  context: string
}
