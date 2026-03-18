'use client'

import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import { Button } from '@app/components/ui/button'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { useState } from 'react'

function CampaignBanner() {
  const trackEvent = useTrackEvent()
  const [open, setOpen] = useState(true)
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'CAMPAIGN_BANNER') return null

  return (
    <div data-testid='campaignPaynote' data-page-theme='campaign-2026'>
      <div
        className={css({
          backgroundColor: 'campaign26Background',
          color: 'campaign26',
          p: 4,
          pb: 2,
          '@media print': {
            display: 'none',
          },
          md: {
            px: 0,
            pb: '8',
          },
        })}
      >
        <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
          <RadixCollapsible.Trigger asChild>
            <button
              className={css({
                display: 'flex',
                width: 'full',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              })}
            >
              <span className={css({ display: 'inline-block', flexGrow: 1 })}>
                {open ? (
                  <span
                    className={css({
                      display: 'block',
                      textAlign: 'left',
                      fontFamily: 'gtAmericaStandard',
                      fontWeight: 700,
                      fontSize: 'l',
                      lineHeight: '1.2',
                      md: {
                        fontSize: '3xl',
                        fontFamily: 'republikSerif',
                        lineHeight: '1',
                      },
                    })}
                  >
                    Mit 2000 neuen Mitgliedern an Bord lösen wir 3 Versprechen
                    ein.
                  </span>
                ) : (
                  <CampaignMembershipsCounter />
                )}
              </span>
              <span className={css({ flexShrink: 0, display: 'inline-block' })}>
                {open ? (
                  <IconExpandLess size={28} />
                ) : (
                  <IconExpandMore size={28} />
                )}
              </span>
            </button>
          </RadixCollapsible.Trigger>
          <RadixCollapsible.Content
            data-collapsible-collapsed-items
            className={css({
              overflow: 'hidden',
              animationTimingFunction: 'ease-out',
              animationDuration: '300ms',
              '&[data-state="open"]': {
                animationName: 'radixCollapsibleSlideDown',
              },
              '&[data-state="closed"]:not([hidden])': {
                animationName: 'radixCollapsibleSlideUp',
              },
            })}
          >
            <div
              className={css({
                maxWidth: 'carousel',
                mx: 'auto',
              })}
            >
              <Link
                href='/drei-versprechen'
                className={css({
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  textStyle: 'airy',
                  mb: 6,
                })}
              >
                Mehr erfahren
              </Link>
              <div className={css({ my: 6 })}>
                <CampaignMembershipsCounter />
              </div>
              <Button
                size='full'
                className={css({
                  background: 'campaign26Button',
                  color: 'white',
                  mb: 2,
                })}
                onClick={() => {
                  trackEvent({
                    action: 'click',
                    label: 'cta',
                  })
                }}
              >
                Kampagne teilen
              </Button>
            </div>
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      </div>
    </div>
  )
}

function CampaignBannerWithEvents() {
  return (
    <EventTrackingContext category='CampaignBanner'>
      <CampaignBanner />
    </EventTrackingContext>
  )
}

export default CampaignBannerWithEvents
