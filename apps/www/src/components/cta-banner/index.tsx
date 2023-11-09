import {
  CALL_TO_ACTIONS_QUERY,
  CallToActionsQueryResult,
} from '@app/graphql/republik-api/cta-banner.query'
import { getClient } from '@app/lib/apollo/client'
import { CTABasicBanner } from './basic-banner'
import { CTARenderer } from './cta-renderer'

export async function CTABanner() {
  const client = await getClient()
  const { data } = await client.query<CallToActionsQueryResult>({
    query: CALL_TO_ACTIONS_QUERY,
  })

  const ctas =
    data?.me?.callToActions?.filter((cta) => cta.acknowledgedAt === null) || []
  if (ctas.length == 0) {
    return null
  }

  return <CTARenderer cta={ctas[0]} />
}
