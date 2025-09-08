'use client'

import { CampaignHeroSection } from '@app/app/(campaign)/components/campaign-hero'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import * as Dialog from '@radix-ui/react-dialog'
import { IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { useMe } from 'lib/context/MeContext'
import { useTranslation } from 'lib/withT'
import { useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import { getMeteringData } from '../article-metering'
import IosCTA from '../ios-cta'
import { usePaynoteVariants } from '../paynote/use-paynotes'
// import {
//   CampaignHero,
//   CampaignHeroMini,
// } from '@app/components/paynotes/campaign-paynote/campaign-hero'

const ARTICLE_SCROLL_THRESHOLD = 0.15 // how much of page has scrolled

type ContentVariant = 'paynote' | 'offers-only'

function MiniPaynoteMessage({
  message,
  onClick,
}: {
  message: string
  onClick: () => void
}) {
  const { isIOSApp } = usePlatformInformation()
  const { t } = useTranslation()

  if (isIOSApp) {
    return (
      <div>
        <span>{t('paynotes/ios/caption')}</span>
        <IosCTA />
      </div>
    )
  }

  const words = message.split(' ')

  return (
    <Dialog.Trigger
      onClick={onClick}
      className={css({
        textAlign: 'left',
        lineHeight: 1.5,
      })}
    >
      <span>
        {words.map((word) => {
          return word === '{PRICE_MONTHLY}' ? (
            <span key={word} className={css({ whiteSpace: 'nowrap' })}>
              <del>CHF 22.–</del> CHF 11.–{' '}
            </span>
          ) : (
            <Fragment key={word}>{word} </Fragment>
          )
        })}
      </span>
      <span
        className={css({
          textStyle: 'sansSerifRegular',
          textDecoration: 'underline',
          fontSize: 'base',
          cursor: 'pointer',
          // mx: 'auto',
          display: 'block',

          mt: '4',
          md: {
            display: 'inline-block',
            mt: 0,
          },
        })}
      >
        Mehr Erfahren
      </span>
    </Dialog.Trigger>
  )
}

function PaynoteOverlayDialog({ isExpanded = false }) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [scrollThresholdReached, setScrollThresholdReached] =
    useState<boolean>(false)
  const [variant, setVariant] = useState<ContentVariant>('offers-only')
  const paynotes = usePaynoteVariants()
  const trackEvent = useTrackEvent()
  const pathname = usePathname()
  const { me, trialStatus } = useMe()
  const { setPaynoteInlineHeight } = usePaynotes()
  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress > ARTICLE_SCROLL_THRESHOLD) {
      setScrollThresholdReached(true)
    }
  })

  const { ref } = useResizeObserver<HTMLDivElement>({
    box: 'border-box',
    onResize: ({ height }) => {
      setPaynoteInlineHeight(height)
    },
  })

  useEffect(() => {
    if (paynotes && scrollThresholdReached) {
      if (isExpanded) {
        setVariant('paynote')
        setExpanded(true)
        trackEvent({
          action: 'Opened on scroll',
          paynoteTitle: paynotes?.paynote.title,
        })
      }
    }
  }, [isExpanded, scrollThresholdReached, trackEvent, paynotes])

  if (!paynotes) {
    return null
  }

  const { paynote, miniPaynote } = paynotes

  const paynoteVariantForAnalytics =
    variant === 'paynote' ? paynote.title : miniPaynote.message

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <div
        ref={ref}
        data-theme='light'
        className={css({
          backgroundColor: '#313131',
          color: 'white',
          position: 'fixed',
          inset: 'auto 0 0 0',
          zIndex: 9998,
          p: '6',
          textAlign: 'left',
          textStyle: 'sans',
          boxShadow: 'sm',
          spaceY: '4',
          '@media print': {
            display: 'none',
          },
          '&:has([data-state="open"])': {
            animation: 'fadeOut',
          },
          '&:has([data-state="closed"])': {
            animation: 'fadeIn',
          },
        })}
      >
        <div
          className={css({
            fontSize: '3xl',
            fontFamily: 'republikSerif',
            textAlign: 'left',
            lineHeight: '1',
          })}
        >
          Uns ist es nicht egal.
        </div>
        <MiniPaynoteMessage
          message={
            'Und Ihnen? Die Republik für alle ab CHF 1.- im ersten Monat.'
          }
          onClick={() => {
            setVariant('offers-only')
            trackEvent({ action: 'Opened on click' })
          }}
        />
      </div>

      <Dialog.Portal>
        <Dialog.Overlay
          data-theme='light'
          className={css({
            backgroundColor: 'overlay',
            position: 'fixed',
            color: 'text',
            inset: 0,
            display: 'grid',
            placeItems: 'end stretch',
            overflowY: 'auto',
            zIndex: 9999,

            _stateOpen: { animation: 'fadeIn' },
            _stateClosed: {
              animation: 'fadeOut',
            },
          })}
        >
          <Dialog.Content
            onEscapeKeyDown={() =>
              trackEvent({
                action: 'Closed via escape key',
                paynoteTitle: variant === 'paynote' ? paynote.title : undefined,
              })
            }
            onPointerDownOutside={() =>
              trackEvent({
                action: 'Closed via click outside',
                paynoteTitle: variant === 'paynote' ? paynote.title : undefined,
              })
            }
            aria-describedby={undefined}
            className={css({
              position: 'relative',
              background: 'background.marketing',
              // px: '8',
              // pt: '12',
              boxShadow: 'sm',
              // mt: '15dvh',
              mt: '0',
              _stateOpen: {
                animation: 'fadeIn',
              },
              _stateClosed: {
                animation: 'fadeOut',
              },
            })}
          >
            <CampaignHeroSection>
              <Dialog.Title asChild>
                <h2
                  className={css({
                    px: '4',
                  })}
                >
                  Uns ist es nicht egal.
                </h2>
              </Dialog.Title>
            </CampaignHeroSection>

            <div
              data-testid='paynote-overlay'
              className={css({
                margin: '0 auto',
                maxW: 'content.narrow',
                textStyle: 'sansSerifRegular',
                fontSize: 'l',
                display: 'flex',
                flexDir: 'column',
                gap: '4',
                px: '4',
                pt: '8',
                lineHeight: 1.5,
              })}
            >
              <p>
                Wir möchten, dass Sie sich in diesen chaotischen Zeiten
                zurechtfinden können. Denn nur wer gut informiert ist, kann auch
                etwas tun.
              </p>

              <h3
                className={css({
                  textTransform: 'uppercase',
                  fontWeight: 'medium',
                })}
              >
                Nur für kurze Zeit
              </h3>

              <p>Die Republik ab CHF 1.– im ersten Monat.</p>

              <Offers
                additionalShopParams={{
                  rep_ui_component: 'paynote-overlay',
                  rep_paynote_title: paynoteVariantForAnalytics,
                  rep_trial_status: trialStatus,
                  ...getMeteringData('rep_'),
                }}
              />

              <Dialog.Close
                className={css({
                  textStyle: 'sansSerifRegular',
                  textDecoration: 'underline',
                  fontSize: 's',
                  cursor: 'pointer',
                  mx: 'auto',
                  pb: '4',
                })}
                onClick={() => {
                  trackEvent({
                    action: 'Closed via "Not now"',
                    paynoteTitle:
                      variant === 'paynote' ? paynote.title : undefined,
                  })
                }}
              >
                Nicht jetzt
              </Dialog.Close>
            </div>

            {!me && (
              <div
                className={css({
                  py: '6',
                  mt: '2',
                  mx: '-8',
                  textAlign: 'center',
                  borderTopWidth: 1,
                  borderTopStyle: 'solid',
                  borderTopColor: 'default',
                  fontSize: 's',
                })}
              >
                Sie haben schon ein Abonnement?{' '}
                <Link
                  className={css({
                    textDecoration: 'underline',
                    color: 'text.marketingAccent',
                    fontWeight: 'medium',
                  })}
                  href={`/anmelden?redirect=${encodeURIComponent(pathname)}`}
                >
                  Anmelden
                </Link>
              </div>
            )}

            <Dialog.Close
              aria-label='Schliessen'
              className={css({
                position: 'absolute',
                top: '4',
                right: '4',
                color: 'white',
              })}
              onClick={() => {
                trackEvent({
                  action: 'Closed via icon',
                  paynoteTitle:
                    variant === 'paynote' ? paynote.title : undefined,
                })
              }}
            >
              <IconExpandMore size={32} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function CampaignOverlay() {
  const { paynoteKind } = usePaynotes()
  const pathname = usePathname()

  return paynoteKind === 'CAMPAIGN_OVERLAY_OPEN' ||
    paynoteKind === 'CAMPAIGN_OVERLAY_CLOSED' ? (
    <EventTrackingContext category='CampaignOverlay'>
      <PaynoteOverlayDialog
        key={pathname}
        isExpanded={paynoteKind === 'CAMPAIGN_OVERLAY_OPEN'}
      />
    </EventTrackingContext>
  ) : null
}
