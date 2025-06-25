import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { useMe } from 'lib/context/MeContext'
import { useEffect } from 'react'

import { PaynoteContainer } from '../../ui/containers'

import { getMeteringData } from '../article-metering'

import { Offers } from './offers'

// Assumptions:
// - the Paywall is only shown to user who are logged in
// - users who are not logged in will always see the Regwall
function Paywall() {
  const trackEvent = useTrackEvent()
  const { trialStatus } = useMe()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <PaynoteContainer testId='paywall'>
      <Offers
        additionalShopParams={{
          rep_ui_component: 'paywall',
          rep_trial_status: trialStatus,
          ...getMeteringData('rep_'),
        }}
      />
    </PaynoteContainer>
  )
}

function PaywallWithEvents() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'PAYWALL') return null

  return (
    <EventTrackingContext category='Paywall'>
      <Paywall />
    </EventTrackingContext>
  )
}

export default PaywallWithEvents
