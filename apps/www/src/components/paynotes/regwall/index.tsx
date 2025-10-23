import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { useMe } from 'lib/context/MeContext'
import { useEffect } from 'react'

import { PaynoteContainer } from '../../ui/containers'

import { getMeteringData } from '../article-metering'

import Offers from './offers'
import Trial from './trial'

const Regwall = () => {
  const trackEvent = useTrackEvent()
  const { trialStatus } = useMe()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <PaynoteContainer testId='regwall'>
      <Trial />
      <Offers
        additionalShopParams={{
          rep_ui_component: 'regwall',
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
