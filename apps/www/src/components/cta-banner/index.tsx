import { getClient } from '@app/lib/apollo/client'
import { CTARenderer } from './cta-renderer'
import { MyCallToActionsDocument } from '@graphql/republik-api/gql/graphql'

export async function CTABanner() {
  const client = await getClient()
  const { data } = await client.query({
    query: MyCallToActionsDocument,
  })

  const ctas =
    data?.me?.callToActions?.filter((cta) => cta.acknowledgedAt === null) || []
  if (ctas.length == 0) {
    return null
  }

  return <CTARenderer cta={ctas[0]} />
}
