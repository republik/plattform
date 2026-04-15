'use client'
import CampaignMembershipsCounter from '@/app/kampagne/components/campaign-memberships-counter'
import { Offers } from '@/app/kampagne/components/campaign-offers'
import { useCampaign } from '@app/components/paynotes/campaign/use-campaign'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import Login from '@app/components/paynotes/regwall/login'
import { ArticleSection } from '@app/components/ui/section'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const PROMISE_COPIES = [
  'Mit einem Abo lesen Sie weiter. Und Schülerinnen in der Schweiz auch.',
  'Mit einem Abo lesen Sie weiter. Und Erstwählerinnen in der Schweiz auch.',
  'Mit einem Abo lesen Sie weiter. Und Ihr Freund auch.',
]

function CampaignPaywall() {
  const [promiseCopy] = useState(PROMISE_COPIES[Math.floor(Math.random() * 3)])
  const trackEvent = useTrackEvent()
  const { success } = useCampaign()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <>
      <div data-testid='campaignPaywall' data-page-theme='campaign-2026'>
        <div
          className={css({
            borderBottomStyle: 'solid',
            borderBottomWidth: '1',
            borderBottomColor: 'black',
            background: 'campaign26Background',
            color: 'campaign26',
          })}
        >
          <ArticleSection
            className={css({
              py: '6',
              md: { pt: '8' },
            })}
          >
            <CampaignMembershipsCounter />
            <h2
              className={css({
                textStyle: 'campaignHeading',
                mt: 10,
                mb: '2',
                md: { mb: '4' },
              })}
            >
              {promiseCopy}
            </h2>
            {success ? (
              <p
                className={css({
                  textStyle: 'heavy',
                })}
              >
                <span className={css({ fontWeight: 400 })}>
                  Dank 2000&nbsp;neuen Mitgliedern lösen wir{' '}
                  <span
                    className={css({
                      textDecoration: 'underline',
                      fontWeight: 700,
                    })}
                  >
                    <Link href='/kampagne/2000-mitglieder-3-versprechen'>
                      3&nbsp;Versprechen
                    </Link>
                  </span>{' '}
                  ein.
                </span>
                <br />
                Sie fehlen noch!
              </p>
            ) : (
              <p
                className={css({
                  textStyle: 'heavy',
                })}
              >
                Bis 14.&nbsp;April: Wenn wir 2000&nbsp;neue Mitglieder finden,
                dann lösen wir{' '}
                <span
                  className={css({
                    textDecoration: 'underline',
                    fontWeight: 700,
                  })}
                >
                  <Link href='/kampagne/2000-mitglieder-3-versprechen'>
                    3&nbsp;Versprechen
                  </Link>
                </span>{' '}
                ein.
              </p>
            )}
          </ArticleSection>
          <ArticleSection
            className={css({
              py: 8,
              background: 'campaign26.happyCherry',
              color: 'white',
              md: {
                pt: 0,
                background: 'campaign26Background',
                color: 'campaign26',
              },
            })}
          >
            <p
              className={css({
                textStyle: 'airy',
                mb: 4,
                md: { textStyle: 'heavy', mb: '6' },
              })}
            >
              Ein Jahr Republik zum Preis Ihrer Wahl:
            </p>
            <div
              data-theme='bright'
              className={css({ md: { display: 'none' } })}
            >
              <Offers
                additionalShopParams={{
                  rep_ui_component: 'campaign-paywall',
                  rep_paynote_title: promiseCopy,
                }}
              />
            </div>
            <div className={css({ display: 'none', md: { display: 'block' } })}>
              <Offers
                additionalShopParams={{
                  rep_ui_component: 'campaign-paywall',
                  rep_paynote_title: promiseCopy,
                }}
              />
            </div>
            <p
              className={css({
                textAlign: 'center',
                mt: 4,
                md: {
                  textStyle: 'heavy',
                  mt: 6,
                },
              })}
            >
              Jederzeit kündbar
            </p>
          </ArticleSection>
        </div>
      </div>
      <div
        className={css({
          my: '2',
          md: { my: '4' },
        })}
      >
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
