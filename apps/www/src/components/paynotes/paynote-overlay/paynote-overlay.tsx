'use client'

import { css } from '@republik/theme/css'
import { Fragment, useEffect, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { Offers } from '@app/components/paynotes/paynote-overlay/paynote-offers'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { IconExpandMore } from '@republik/icons'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { StructuredText } from 'react-datocms'
import { usePaynoteVariants } from './use-paynotes'
import { useMe } from 'lib/context/MeContext'
import { getMeteringData } from '../article-metering'

const ARTICLE_SCROLL_THRESHOLD = 0.15 // how much of page has scrolled

type ContentVariant = 'paynote' | 'offers-only'

function MiniPaynoteMessage({ message }: { message: string }) {
  const words = message.split(' ')

  return (
    <>
      {words.map((word) => {
        return word === '{PRICE_MONTHLY}' ? (
          <span key={word} className={css({ whiteSpace: 'nowrap' })}>
            <del>CHF 22.–</del> CHF 11.–{' '}
          </span>
        ) : (
          <Fragment key={word}>{word} </Fragment>
        )
      })}
    </>
  )
}

function PaynoteOverlayDialog({ isExpanded = false }) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [scrollThresholdReached, setScrollThresholdReached] =
    useState<boolean>(false)
  const [variant, setVariant] = useState<ContentVariant>('offers-only')
  const { isIOSApp } = usePlatformInformation()
  const paynotes = usePaynoteVariants()
  const trackEvent = useTrackEvent()
  const pathname = usePathname()
  const { me, trialStatus } = useMe()

  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress > ARTICLE_SCROLL_THRESHOLD) {
      setScrollThresholdReached(true)
    }
  })

  // TODO: iOS?
  const ready = paynotes && !isIOSApp

  useEffect(() => {
    if (ready && scrollThresholdReached) {
      if (isExpanded) {
        setVariant('paynote')
        setExpanded(true)
        trackEvent({
          action: 'Opened on scroll',
          paynoteTitle: paynotes?.paynote.title,
        })
      }
    }
  }, [ready, isExpanded, scrollThresholdReached, trackEvent, paynotes])

  if (!ready) {
    return null
  }

  const { paynote, miniPaynote } = paynotes

  const paynoteVariantForAnalytics =
    variant === 'paynote' ? paynote.title : miniPaynote.message

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <div
        data-theme='light'
        className={css({
          backgroundColor: 'background.marketingAccent',
          color: 'text',
          position: 'fixed',
          inset: 'auto 0 0 0',
          zIndex: 9998,
          p: '6',
          textAlign: 'center',
          textStyle: 'sans',
          boxShadow: 'sm',
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
        <span>
          <MiniPaynoteMessage message={miniPaynote.message} />
        </span>
        <Dialog.Trigger
          className={css({
            textStyle: 'sansSerifRegular',
            textDecoration: 'underline',
            fontSize: 'base',
            cursor: 'pointer',
            mx: 'auto',
            display: 'block',

            mt: '4',
            md: {
              display: 'inline-block',
              mt: 0,
            },
          })}
          onClick={() => {
            setVariant('offers-only')
            trackEvent({ action: 'Opened on click' })
          }}
        >
          Mehr erfahren
        </Dialog.Trigger>
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
              px: '8',
              pt: '12',
              boxShadow: 'sm',
              mt: '15dvh',
              _stateOpen: {
                animation: 'fadeIn',
              },
              _stateClosed: {
                animation: 'fadeOut',
              },
            })}
          >
            <div
              className={css({
                margin: '0 auto',
                maxW: '34rem',
                textStyle: 'serifRegular',
                lineHeight: 1.6,
                fontSize: 'l',
                display: 'flex',
                flexDir: 'column',
                gap: '4',
              })}
            >
              {variant === 'paynote' && paynote?.author && (
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    placeItems: 'center start',
                    gap: '4',

                    textStyle: 'sansSerifRegular',
                  })}
                >
                  <Image
                    src={paynote.author.portrait.url}
                    unoptimized
                    alt='Portraitbild'
                    width={160}
                    height={160}
                    className={css({
                      borderRadius: 'full',
                    })}
                  />

                  <div>
                    <div className={css({ fontWeight: 'medium' })}>
                      {paynote.author.name}
                    </div>
                    <div>{paynote.author.description}</div>
                  </div>
                </div>
              )}

              <Dialog.Title asChild>
                <h2
                  className={css({
                    textStyle: { base: 'h3Serif', sm: 'h2Serif' },
                    lineHeight: 1.4,
                  })}
                >
                  {variant === 'paynote' ? (
                    <span
                      className={css({
                        boxDecorationBreak: 'clone',
                        px: '1',
                        backgroundColor: 'background.marketingAccent',
                        ml: '-0.5',
                        position: 'relative',
                      })}
                    >
                      {paynote?.title}
                    </span>
                  ) : (
                    <>Unterstützen Sie unab&shy;hängigen Journalismus</>
                  )}
                </h2>
              </Dialog.Title>

              {variant === 'paynote' ? (
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4',
                    pb: '4',
                    fontSize: 18,
                  })}
                >
                  <StructuredText
                    data={paynote?.message.value}
                  ></StructuredText>
                </div>
              ) : null}

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

export function PaynoteOverlay() {
  const { paynoteKind } = usePaynotes()

  return paynoteKind === 'OVERLAY_OPEN' || paynoteKind === 'OVERLAY_CLOSED' ? (
    <EventTrackingContext category='PaynoteOverlay'>
      <PaynoteOverlayDialog isExpanded={paynoteKind === 'OVERLAY_OPEN'} />
    </EventTrackingContext>
  ) : null
}
