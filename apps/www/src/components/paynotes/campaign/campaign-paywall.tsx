import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import Login from '@app/components/paynotes/regwall/login'
import { ArticleSection } from '@app/components/ui/section'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { useEffect } from 'react'

function CampaignPaywall() {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div data-testid='campaignPaywall' data-page-theme='campaign-2026'>
      <div
        data-theme='light'
        className={css({
          borderBottomStyle: 'solid',
          borderBottomWidth: '1',
          borderBottomColor: 'black',
        })}
      >
        <ArticleSection
          className={css({
            background: 'background',
            color: 'text',
            py: '6',
          })}
        >
          <CampaignMembershipsCounter />
          <h2
            className={css({
              textStyle: 'campaignHeading',
              mb: '2',
              md: { mb: '4' },
            })}
          >
            Mit einem Abo lesen Sie weiter. Und Schülerinnen in der Schweiz
            auch.
          </h2>
          <p
            className={css({
              textStyle: 'heavy',
            })}
          >
            Bis 14. April: Wenn wir 2000 neue Mitglieder finden, dann lösen wir{' '}
            <span
              className={css({ textDecoration: 'underline', fontWeight: 700 })}
            >
              <Link href='/drei-versprechen'>3 Versprechen</Link>
            </span>{' '}
            ein.
          </p>
        </ArticleSection>
        <ArticleSection
          className={css({
            py: '6',
            background: 'campaign2026.happyCherry',
            color: 'white',
            md: {
              pt: 0,
              background: 'campaign2026.frozenYogurt',
              color: 'campaign2026.happyCherry',
            },
          })}
        >
          <p
            className={css({
              textStyle: 'airy',
              mb: '4',
              md: { textStyle: 'heavy' },
            })}
          >
            Wählen Sie Ihren Preis für das erste Jahr:
          </p>
          <div data-theme='bright' className={css({ md: { display: 'none' } })}>
            <Offers
              additionalShopParams={{
                rep_ui_component: 'campaign-paywall',
              }}
            />
          </div>
          <div
            data-theme='light'
            className={css({ display: 'none', md: { display: 'block' } })}
          >
            <Offers
              additionalShopParams={{
                rep_ui_component: 'campaign-paywall',
              }}
            />
          </div>
          <p
            className={css({
              color: 'campaign2026.frozenYogurt',
              textAlign: 'center',
              my: '4',
              md: {
                textStyle: 'heavy',
                color: 'campaign2026.happyCherry',
                mt: '6',
              },
            })}
          >
            Jederzeit kündbar
          </p>
        </ArticleSection>
      </div>
      <div className={css({ my: '2', md: { my: '4' } })}>
        <Login />
      </div>
    </div>
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
