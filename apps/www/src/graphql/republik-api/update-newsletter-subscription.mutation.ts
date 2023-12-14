import { gql } from '@apollo/client'

export const UPDATE_NEWSLETTER_SUBSCRIPTION_MUTATION = gql`
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
`

export type UpdateNewsletterSubscriptionMutationResult = {
  updateNewsletterSubscription: {
    id: string
    name: string
    subscribed: boolean
  }
}

export type UpdateNewsletterSubscriptionMutationVariables = {
  name: string
  subscribed: boolean
}
