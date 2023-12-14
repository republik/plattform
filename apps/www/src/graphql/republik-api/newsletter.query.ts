import { gql } from '@apollo/client'

export const CA_NEWSLETTER_QUERY = gql(`
  query CANewsletterQuery(
    $name: NewsletterName!
  ) {
    me {
      newsletterSettings {
        id
        status
        subscriptions(name: $name) {
          id
          name
          subscribed
        }
      }
    }
  }
`)

export type CANewsletterQueryResult = {
  me: null | {
    newsletterSettings: {
      id: string
      status: string
      subscriptions:
        | null
        | ({
            id: string
            name: string
            subscribed: boolean
          } | null)[]
    }
  }
}

export type CANewsletterQueryVariables = {
  name: string
}
