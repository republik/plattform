import { gql } from './gql'

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
