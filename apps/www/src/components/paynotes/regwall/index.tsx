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
  const regwallTitle = 'Version A' // TODO
  const { trialStatus } = useMe()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
      regwallTitle,
    })
  }, [trackEvent])

  return (
    <PaynoteContainer>
      <Trial analyticsProps={{ regwallTitle }} />
      <Offers
        additionalShopParams={{
          rep_ui_component: 'regwall',
          rep_regwall_title: regwallTitle,
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
