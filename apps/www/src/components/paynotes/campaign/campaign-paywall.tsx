import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import Container from '@app/components/container'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import Login from '@app/components/paynotes/regwall/login'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useEffect } from 'react'

function CampaignPaywall() {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <>
      <div
        data-testid='campaignPaywall'
        className={css({
          background: 'campaign2026.frozenYogurt',
          color: 'campaign2026.happyCherry',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1',
          borderBottomColor: 'black',
        })}
      >
        <Container
          className={css({
            py: '4',
          })}
        >
          <CampaignMembershipsCounter />
          <h2>
            Mit einem Abo lesen Sie weiter. Und Schülerinnen in der Schweiz
            auch.
          </h2>
          <p>
            Bis 14. April: Well wir 2000 neue Miglieder finden, dann lösen wir 3
            Versprechen ein.
          </p>
        </Container>
        <Container
          className={css({
            background: 'campaign2026.happyCherry',
            py: '4',
            color: 'white',
          })}
        >
          <p className={css({ textStyle: 'airy', mb: '4' })}>
            Wählen Sie Ihren Preis für das erste Jahr:
          </p>
          <Offers
            additionalShopParams={{
              rep_ui_component: 'campaign-paywall',
            }}
          />
          <p
            className={css({
              color: 'campaign2026.frozenYogurt',
              textAlign: 'center',
              my: '2',
            })}
          >
            Jederzeit kündbar
          </p>
        </Container>
      </div>
      <div className={css({ my: '2', md: { my: '4' } })}>
        <Login />
      </div>
    </>
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
