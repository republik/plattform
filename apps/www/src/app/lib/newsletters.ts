import { CaNewsletterDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@/app/lib/apollo/client'

export async function getNewsletterSubscriptionStatus({
  newsletterName,
}: {
  newsletterName: string
}) {
  // Wrap GraphQL API calls in try/catch because Apollo Client will throw on networkError
  try {
    const client = await getClient()
    const { data } = await client.query({
      query: CaNewsletterDocument,
      variables: {
        name: newsletterName,
      },
    })

    return !!data?.me?.newsletterSettings?.subscriptions?.[0]?.subscribed
  } catch (e) {
    return false
  }
}
