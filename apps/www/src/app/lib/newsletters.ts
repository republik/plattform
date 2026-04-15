import { CaNewsletterDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

export async function getNewsletterSubscriptionStatus({
  newsletterName,
}: {
  newsletterName: string
}) {
  const client = await getClient()
  const { data } = await client.query({
    query: CaNewsletterDocument,
    variables: {
      name: newsletterName,
    },
  })

  return !!data?.me?.newsletterSettings?.subscriptions?.[0]?.subscribed
}
