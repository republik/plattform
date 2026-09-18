'use client'

import { Offers } from '@/app/components/paynotes/paynote/paynote-offers'
import {
  HERBST26_HEADLINE,
  HERBST26_MINI_NOTE,
  isHerbst26Active,
} from '@/app/components/paynotes/herbst26'
import { usePaynotes } from '@/app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'

import * as Dialog from '@radix-ui/react-dialog'
import { IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { useMe } from '@/lib/context/MeContext'
import { useTranslation } from '@/lib/withT'
import { useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { StructuredText } from 'react-datocms/structured-text'
import useResizeObserver from 'use-resize-observer'
import { getMeteringData } from '../article-metering'
import NativeCta from '../native-cta'
import PaynoteAuthor from './paynote-author'
import { usePaynoteVariants } from './use-paynotes'

const ARTICLE_SCROLL_THRESHOLD = 0.15 // how much of page has scrolled

type ContentVariant = 'paynote' | 'offers-only'

function MiniPaynoteMessage({
  message,
  onClick,
}: {
  message: string
  onClick: () => void
}) {
  const { isNativeApp } = usePlatformInformation()
  const { t } = useTranslation()

  if (isNativeApp) {
    return (
      <div>
        <span>{t('paynotes/native/caption')}</span>
        <NativeCta />
      </div>
    )
  }

  const words = message.split(' ')

  return (
    <Dialog.Trigger onClick={onClick}>
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
          mx: 'auto',
          display: 'block',

          mt: '4',
          md: {
            display: 'inline-block',
            mt: 0,
          },
        })}
      >
        Mehr erfahren
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
  const isHerbst26 = isHerbst26Active()

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
    if ((paynotes || isHerbst26) && scrollThresholdReached) {
      if (isExpanded) {
        setVariant('paynote')
        setExpanded(true)
        trackEvent({
          action: 'Opened on scroll',
          paynoteTitle: isHerbst26
            ? HERBST26_HEADLINE
            : paynotes?.paynote.title,
        })
      }
    }
  }, [isExpanded, scrollThresholdReached, trackEvent, paynotes, isHerbst26])

  const paynote = paynotes?.paynote

  // Herbst-26 special: fixed copy everywhere, the CMS paynote is not used and
  // we don't wait for it either.
  const title = isHerbst26 ? HERBST26_HEADLINE : paynote?.title
  const miniMessage = isHerbst26
    ? HERBST26_MINI_NOTE
    : paynotes?.miniPaynote.message

  // Outside the window this is exactly the previous `if (!paynotes)` guard.
  if (!isHerbst26 && !paynotes) {
    return null
  }

  const showCmsPaynote = !isHerbst26 && variant === 'paynote' && !!paynote

  const paynoteVariantForAnalytics = isHerbst26
    ? HERBST26_MINI_NOTE
    : variant === 'paynote'
    ? paynote?.title
    : miniMessage

  const trackedPaynoteTitle = isHerbst26
    ? HERBST26_HEADLINE
    : variant === 'paynote'
    ? paynote?.title
    : undefined

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <div
        ref={ref}
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
        <MiniPaynoteMessage
          message={miniMessage}
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
                paynoteTitle: trackedPaynoteTitle,
              })
            }
            onPointerDownOutside={() =>
              trackEvent({
                action: 'Closed via click outside',
                paynoteTitle: trackedPaynoteTitle,
              })
            }
            aria-describedby={undefined}
            className={css({
              position: 'relative',
              background: 'background',
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
              data-testid='paynote-overlay'
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
              {showCmsPaynote && <PaynoteAuthor author={paynote.author} />}

              <Dialog.Title asChild>
                <h2
                  className={css({
                    textStyle: { base: 'h3Serif', sm: 'h2Serif' },
                    lineHeight: 1.4,
                  })}
                >
                  {isHerbst26 || variant === 'paynote' ? (
                    <span
                      className={css({
                        backgroundColor: 'text.marketingAccent',
                        boxDecorationBreak: 'clone',
                        px: '1',
                        ml: '-0.5',
                        position: 'relative',
                      })}
                    >
                      {title}
                    </span>
                  ) : (
                    <>Unterstützen Sie unab&shy;hängigen Journalismus</>
                  )}
                </h2>
              </Dialog.Title>

              {showCmsPaynote ? (
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
                    paynoteTitle: trackedPaynoteTitle,
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
                  paynoteTitle: trackedPaynoteTitle,
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
  const pathname = usePathname()

  const showOverlay =
    paynoteKind === 'OVERLAY_OPEN' ||
    paynoteKind === 'OVERLAY_CLOSED' ||
    paynoteKind === 'HERBST26'

  return showOverlay ? (
    <EventTrackingContext category='PaynoteOverlay'>
      <PaynoteOverlayDialog
        key={pathname}
        isExpanded={
          paynoteKind === 'OVERLAY_OPEN' || paynoteKind === 'HERBST26'
        }
      />
    </EventTrackingContext>
  ) : null
}
