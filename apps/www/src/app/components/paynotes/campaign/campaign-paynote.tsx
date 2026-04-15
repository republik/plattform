'use client'

import CampaignMembershipsCounter from '@/app/kampagne/components/campaign-memberships-counter'
import { Dank } from '@/app/kampagne/components/handdrawn/dank'
import { useCampaign } from '@app/components/paynotes/campaign/use-campaign'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'

import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'

function CampaignPaynote() {
  const trackEvent = useTrackEvent()
  const { success } = useCampaign()

  return (
    <div data-testid='campaignPaynote' data-page-theme='campaign-2026'>
      <div
        data-theme='bright'
        className={css({
          backgroundColor: 'campaign26Background',
          color: 'campaign26',
          position: 'fixed',
          inset: 'auto 0 0 0',
          zIndex: 9998,
          boxShadow: 'sm',
          '@media print': {
            display: 'none',
          },
        })}
      >
        <div
          className={css({
            maxWidth: 'carousel',
            mx: 'auto',
            p: 6,
            md: {
              px: '15px',
              pb: '8',
            },
          })}
        >
          <CampaignMembershipsCounter arrowSize='sm' />

          <div
            className={css({
              md: {
                display: 'flex',
                alignItems: 'top',
                mt: 8,
                gap: 4,
              },
            })}
          >
            <p
              className={css({
                textAlign: 'left',
                fontFamily: 'gtAmericaStandard',
                fontWeight: 700,
                fontSize: 'l',
                lineHeight: '1.2',
                py: 6,
                md: {
                  fontSize: '3xl',
                  fontFamily: 'republikSerif',
                  lineHeight: '1',
                  py: 0,
                },
              })}
            >
              <Dank showDank={success}>Mit</Dank> 2000&nbsp;neuen Mitgliedern
              lösen wir 3&nbsp;Versprechen ein.{' '}
              <br
                className={css({ display: 'none', lg: { display: 'initial' } })}
              />
              {success ? 'Aber Sie fehlen noch!' : 'Machen Sie mit?'}
            </p>
            <div className={css({ textAlign: 'center', ml: 'auto' })}>
              <Link
                href='/kampagne/2000-mitglieder-3-versprechen'
                className={cx(
                  button(),
                  css({
                    background: 'campaign26Button',
                    color: 'white',
                  }),
                )}
                onClick={() => {
                  trackEvent({
                    action: 'click',
                    label: 'cta',
                  })
                }}
              >
                Jetzt 50 % günstiger
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CampaignPaynoteWithEvents() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'CAMPAIGN_PAYNOTE') return null

  return (
    <EventTrackingContext category='CampaignPaynote'>
      <CampaignPaynote />
    </EventTrackingContext>
  )
}

export default CampaignPaynoteWithEvents
