import { gql } from '@apollo/client'
import { getClient } from '@app/lib/apollo/client'

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

export type CANewsterQueryResult = {
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

export async function getClimateLabNewsletterSubscriptionStatus() {
  const { data } = await getClient().query<
    CANewsterQueryResult,
    CANewsletterQueryVariables
  >({
    query: CA_NEWSLETTER_QUERY,
    variables: {
      name: 'CLIMATE', // TODO: check if this is the correct name
    },
  })
  return data.me?.newsletterSettings.subscriptions?.[0]?.subscribed || false
}
