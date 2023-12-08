import { gql } from './gql'

export const SIGN_UP_FOR_NEWSLETTER_MUTATION = gql(`
  mutation SignUpForNewsletter(
    $email: String!
    $name: NewsletterName!
    $context: String!
  ) {
    requestNewsletterSubscription(email: $email, name: $name, context: $context)
  }
`)
