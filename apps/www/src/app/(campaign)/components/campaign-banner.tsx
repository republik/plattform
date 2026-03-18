'use client'

import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import { Share } from '@app/components/share/share'
import { Button } from '@app/components/ui/button'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PUBLIC_BASE_URL } from '../../../../lib/constants'

const localStorageKey = 'republik-campaign-banner-is-open'
const DEFAULT_IS_OPEN = true

const getLocalIsOpen = (): boolean => {
  if (typeof window === 'undefined') return DEFAULT_IS_OPEN
  try {
    return (
      JSON.parse(window.localStorage.getItem(localStorageKey)) ??
      DEFAULT_IS_OPEN
    )
  } catch (e) {
    return DEFAULT_IS_OPEN
  }
}

const setLocalIsOpen = (data) => {
  try {
    window.localStorage.setItem(localStorageKey, JSON.stringify(data))
  } catch (e) {}
}

// I know the duplication is not ideal but the styles are too different
// and things would have been really tricky to read.
function CampaignBannerMd() {
  const trackEvent = useTrackEvent()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(getLocalIsOpen())
  }, [])

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    setLocalIsOpen(isOpen)
  }

  return (
    <div data-testid='campaignPaynote' data-page-theme='campaign-2026'>
      <div
        className={css({
          backgroundColor: 'campaign26Background',
          color: 'campaign26',
          pt: 6,
          pb: 4,
          '@media print': {
            display: 'none',
          },
        })}
      >
        <div
          className={css({
            maxWidth: 'carousel',
            mx: 'auto',
            px: '15px',
          })}
        >
          <RadixCollapsible.Root open={open} onOpenChange={handleOpen}>
            <RadixCollapsible.Trigger asChild>
              <button
                className={css({
                  display: 'flex',
                  width: 'full',
                  cursor: 'pointer',
                  alignItems: 'start',
                  gap: 6,
                })}
              >
                <span className={css({ display: 'inline-block', flexGrow: 1 })}>
                  <CampaignMembershipsCounter />
                </span>
                <span
                  className={css({ flexShrink: 0, display: 'inline-block' })}
                >
                  {open ? (
                    <IconExpandLess size={32} />
                  ) : (
                    <IconExpandMore size={32} />
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
                  mt: 8,
                  display: 'flex',
                  gap: 2,
                })}
              >
                <p
                  className={css({
                    maxWidth: '600px',
                    flexGrow: 1,
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '3xl',
                    fontFamily: 'republikSerif',
                    lineHeight: '1',
                    mr: 'auto',
                  })}
                >
                  Mit 2000 neuen Mitgliedern lösen wir 3 Versprechen ein.
                </p>
                <div className={css({ mt: 'auto' })}>
                  <Share
                    title='2000 neue Mitglieder, 3 Versprechen'
                    url={`${PUBLIC_BASE_URL}/drei-versprechen`}
                    emailSubject='2000 neue Mitglieder, 3 Versprechen'
                  >
                    <Button
                      size='large'
                      className={css({
                        background: 'campaign26Button',
                        color: 'white',
                      })}
                      onClick={() => {
                        trackEvent({
                          action: 'open share overlay',
                        })
                      }}
                    >
                      Kampagne teilen
                    </Button>
                  </Share>
                </div>
                <div className={css({ mt: 'auto' })}>
                  <Link
                    href='/drei-versprechen'
                    className={cx(
                      button({ variant: 'outline', size: 'large' }),
                      css({
                        color: 'campaign26',
                        outlineColor: 'campaign26RadioOutline',
                      }),
                    )}
                  >
                    <span>Mehr erfahren</span>
                  </Link>
                </div>
              </div>
            </RadixCollapsible.Content>
          </RadixCollapsible.Root>
        </div>
      </div>
    </div>
  )
}

function CampaignBanner() {
  const trackEvent = useTrackEvent()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(getLocalIsOpen())
  }, [])

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    setLocalIsOpen(isOpen)
  }

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
        })}
      >
        <RadixCollapsible.Root open={open} onOpenChange={handleOpen}>
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
            <Share
              title='2000 neue Mitglieder, 3 Versprechen'
              url={`${PUBLIC_BASE_URL}/drei-versprechen`}
              emailSubject='2000 neue Mitglieder, 3 Versprechen'
            >
              <Button
                size='full'
                className={css({
                  background: 'campaign26Button',
                  color: 'white',
                  mb: 2,
                })}
                onClick={() => {
                  trackEvent({
                    action: 'open share overlay',
                  })
                }}
              >
                Kampagne teilen
              </Button>
            </Share>
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      </div>
    </div>
  )
}

function CampaignBannerWithEvents() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'CAMPAIGN_BANNER') return null

  return (
    <EventTrackingContext category='CampaignBanner'>
      <div className={css({ display: 'initial', md: { display: 'none' } })}>
        <CampaignBanner />
      </div>
      <div className={css({ display: 'none', md: { display: 'initial' } })}>
        <CampaignBannerMd />
      </div>
    </EventTrackingContext>
  )
}

export default CampaignBannerWithEvents
