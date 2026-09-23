import { MyCallToActionsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@/app/lib/apollo/client'
import { CTARenderer } from './cta-renderer'

export async function CTABanner() {
  try {
    const client = await getClient()
    const { data } = await client.query({
      query: MyCallToActionsDocument,
    })

    const ctas =
      data?.me?.callToActions?.filter((cta) => cta.acknowledgedAt === null) ||
      []
    if (ctas.length == 0) {
      return null
    }

    return <CTARenderer cta={ctas[0]} />
  } catch (error) {
    return null
  }
}
