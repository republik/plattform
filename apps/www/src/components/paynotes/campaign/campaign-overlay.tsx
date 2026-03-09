'use client'

import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import * as Dialog from '@radix-ui/react-dialog'
import { css } from '@republik/theme/css'
import { useMe } from 'lib/context/MeContext'
import { useTranslation } from 'lib/withT'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import NativeCta from '../native-cta'

const ARTICLE_SCROLL_THRESHOLD = 0.15 // how much of page has scrolled

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
        Mehr erfahren
      </span>
    </Dialog.Trigger>
  )
}

function PaynoteOverlayDialog({ isExpanded = false }) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [scrollThresholdReached, setScrollThresholdReached] =
    useState<boolean>(false)
  const trackEvent = useTrackEvent()
  const pathname = usePathname()
  const { me } = useMe()
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
    if (scrollThresholdReached) {
      if (isExpanded) {
        setExpanded(true)
        trackEvent({
          action: 'Opened on scroll',
        })
      }
    }
  }, [isExpanded, scrollThresholdReached, trackEvent])

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
            'Und Ihnen? Die Republik für alle ab CHF 1.– im ersten Monat.'
          }
          onClick={() => {
            trackEvent({ action: 'Opened on click' })
          }}
        />
      </div>
    </Dialog.Root>
  )
}

export function CampaignOverlay() {
  const { paynoteKind } = usePaynotes()
  const pathname = usePathname()

  if (paynoteKind !== 'CAMPAIGN_OVERLAY') return null

  return (
    <EventTrackingContext category='CampaignOverlay'>
      <PaynoteOverlayDialog key={pathname} />
    </EventTrackingContext>
  )
}
