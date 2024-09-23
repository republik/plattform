'use client'

import { css } from '@republik/theme/css'
import { Fragment, useEffect, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import { useMe } from 'lib/context/MeContext'

import { Offers } from '@app/components/paynote-overlay/paynote-offers'
import { usePaynotes } from '@app/components/paynote-overlay/use-paynotes'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { StructuredText } from 'react-datocms'
import Image from 'next/image'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'

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

function PaynoteOverlayDialog() {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [scrollThresholdReached, setScrollThresholdReached] =
    useState<boolean>(false)
  const [variant, setVariant] = useState<ContentVariant>('offers-only')
  const { hasActiveMembership, meLoading } = useMe()
  const { isIOSApp } = usePlatformInformation()
  const paynotes = usePaynotes()
  const trackEvent = useTrackEvent()

  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress > ARTICLE_SCROLL_THRESHOLD) {
      setScrollThresholdReached(true)
    }
  })

  const ready = paynotes && !meLoading && !hasActiveMembership && !isIOSApp

  useEffect(() => {
    if (ready && scrollThresholdReached) {
      const isArticle =
        document.querySelector('[data-template="article"]') != null

      if (isArticle) {
        setVariant('paynote')
        setExpanded(true)
        trackEvent({
          action: 'Opened on scroll',
          paynoteTitle: paynotes?.paynote.title,
        })
      }
    }
  }, [ready, scrollThresholdReached, trackEvent, paynotes])

  if (!ready) {
    return null
  }

  const { paynote, miniPaynote } = paynotes

  const paynoteVariantForAnalytics =
    variant === 'paynote' ? paynote.title : miniPaynote.message

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <div
        className={css({
          backgroundColor: 'text',
          color: 'text.inverted',
          position: 'fixed',
          inset: 'auto 0 0 0',

          zIndex: 9998,

          p: '6',

          textAlign: 'center',
          textStyle: 'sans',
          boxShadow: 'sm',

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
          className={css({
            backgroundColor: 'overlay',
            position: 'fixed',
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
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            aria-describedby={undefined}
            className={css({
              background: 'pageBackground',
              p: '8',
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
                gap: '6',
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
                        backgroundColor: '#FDE047',
                        color: 'text.black',
                        ml: '-0.5',
                        position: 'relative',
                      })}
                    >
                      {paynote?.title}
                    </span>
                  ) : (
                    'Unterstützen Sie unabhängigen Journalismus'
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
                  })}
                >
                  <StructuredText
                    data={paynote?.message.value}
                  ></StructuredText>
                </div>
              ) : null}

              <Offers
                additionalShopParams={{
                  rep_paynote_title: paynoteVariantForAnalytics,
                }}
              />

              <Dialog.Close
                className={css({
                  textStyle: 'sansSerifRegular',
                  textDecoration: 'underline',
                  fontSize: 'base',
                  cursor: 'pointer',
                  mx: 'auto',
                })}
                onClick={() => {
                  trackEvent({
                    action: 'Closed',
                    paynoteTitle:
                      variant === 'paynote' ? paynote.title : undefined,
                  })
                }}
              >
                Jetzt nicht
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function PaynoteOverlay() {
  return (
    <EventTrackingContext category='PaynoteOverlay'>
      <PaynoteOverlayDialog />
    </EventTrackingContext>
  )
}
