import { gql } from './gql'

export const UPDATE_NEWSLETTER_SUBSCRIPTION_MUTATION = gql(`
  mutation updateNewsletterSubscription(
    $name: NewsletterName!
    $subscribed: Boolean!
  ) {
    updateNewsletterSubscription(name: $name, subscribed: $subscribed) {
      id
      name
      subscribed
    }
  }
`)
