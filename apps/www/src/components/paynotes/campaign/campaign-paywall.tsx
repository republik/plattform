import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { useEffect } from 'react'

import { PaynoteContainer } from '../../ui/containers'

function CampaignPaywall() {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <PaynoteContainer testId='campaignPaywall'>
      <CampaignMembershipsCounter />
      <h2>
        Mit einem Abo lesen Sie weiter. Und Schülerinnen in der Schweiz auch.
      </h2>
      <p>
        Bis 14. April: Well wir 2000 neue Miglieder finden, dann lösen wir 3
        Versprechen ein.
      </p>
      <Offers
        additionalShopParams={{
          rep_ui_component: 'campaign-paywall',
        }}
      />
    </PaynoteContainer>
  )
}

function CampaignPaywallWithEvents() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'CAMPAIGN_PAYWALL') return null

  return (
    <EventTrackingContext category='CampaignPaywall'>
      <CampaignPaywall />
    </EventTrackingContext>
  )
}

export default CampaignPaywallWithEvents
