import { useEffect } from 'react'

import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'

import { PaynoteContainer } from '../../ui/containers'

import { getMeteringData } from '../article-metering'

import Trial from './trial'
import Offers from './offers'
import { useMe } from 'lib/context/MeContext'

const Regwall = () => {
  const trackEvent = useTrackEvent()
  const variation = Math.random() < 0.5 ? 'a' : 'b'
  const { trialStatus } = useMe()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
      variation,
    })
  }, [trackEvent])

  const analyticsProps = {
    variation,
    ...getMeteringData(),
  }

  return (
    <PaynoteContainer>
      <Trial analyticsProps={analyticsProps} />
      <Offers
        analyticsProps={analyticsProps}
        additionalShopParams={{
          rep_ui_component: 'regwall',
          rep_regwall_variation: variation,
          rep_trial_status: trialStatus,
          ...getMeteringData('rep_'),
        }}
      />
    </PaynoteContainer>
  )
}

const RegwallWithEvents = () => {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'REGWALL') return null

  return (
    <EventTrackingContext category='Regwall'>
      <Regwall />
    </EventTrackingContext>
  )
}

export default RegwallWithEvents
