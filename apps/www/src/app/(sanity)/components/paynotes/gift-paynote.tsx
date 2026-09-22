'use client'

import { Offers } from '@/app/(sanity)/components/paynotes/paynote/paynote-offers'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { usePaynotes } from './paynotes-context'

/**
 * Same marketing block as the inline paynote, centred: a headline on the
 * accent highlight, a line of copy, and the standard offers — which pick up
 * campaign pricing on their own, so a gift reader is never shown a worse deal
 * than the campaign paynote they didn't get.
 */
function GiftPaynoteBlock({
  headline,
  portrait,
  body,
  uiComponent,
}: {
  headline: string
  portrait?: ReactNode
  body: string
  uiComponent: string
}) {
  return (
    <div
      data-theme='light'
      className={css({
        background: 'background.marketing',
        color: 'text',
        padding: '8',
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
          alignItems: 'center',
          textAlign: 'center',
        })}
      >
        {portrait}
        <h2
          className={css({
            textStyle: { base: 'h3Serif', sm: 'h2Serif' },
            lineHeight: 1.4,
          })}
        >
          <span
            className={css({
              boxDecorationBreak: 'clone',
              px: '1',
              backgroundColor: 'background.marketingAccent',
              ml: '-0.5',
            })}
          >
            {headline}
          </span>
        </h2>
        <p className={css({ fontSize: 18, pb: '4' })}>{body}</p>
        <Offers additionalShopParams={{ rep_ui_component: uiComponent }} />
      </div>
    </div>
  )
}

/**
 * Shown under an article the reader is reading through someone else's gift
 * link. Unlike the paywall it hides nothing — the text above it is theirs to
 * read; this is the invitation that follows.
 */
export function GiftPaynote() {
  const { paynoteKind, giftAccess } = usePaynotes()

  if (paynoteKind !== 'GIFT_PAYNOTE') {
    return null
  }

  // A granter without a public profile stays anonymous: the backend sends a
  // stand-in name and no portrait, and the headline drops the "von ...".
  const granter = giftAccess?.granter
  const granterName = granter?.hasPublicProfile ? granter.name : null

  return (
    <EventTrackingContext category='GiftPaynote'>
      <GiftPaynoteBlock
        headline={
          granterName
            ? `Dieser Artikel wurde Ihnen von ${granterName} geschenkt`
            : 'Dieser Artikel wurde Ihnen geschenkt'
        }
        portrait={
          granterName &&
          granter.portrait && (
            <Image
              src={granter.portrait}
              unoptimized
              alt='Portraitbild'
              width={128}
              height={128}
              className={css({
                borderRadius: 'full',
                width: '64px',
                height: '64px',
                objectFit: 'cover',
              })}
            />
          )
        }
        body='Gefällt Ihnen, was Sie lesen? Werden Sie Mitglied und erhalten Sie unbegrenzten Zugang zu allen Artikeln.'
        uiComponent='gift-paynote'
      />
    </EventTrackingContext>
  )
}

/**
 * The link was redeemed on this device, but its 14 days are up. Sits with the
 * paywalls in `ContentWall` and counts as one (see `PAYWALL_KINDS`), so the
 * article is cut off again — but it says why, rather than dropping the reader
 * onto the same wall as everyone else.
 */
export function GiftExpiredPaynote() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'GIFT_EXPIRED') {
    return null
  }

  return (
    <EventTrackingContext category='GiftExpiredPaynote'>
      <GiftPaynoteBlock
        headline='Dieser Geschenk-Link ist abgelaufen'
        body='Der Zugang zu diesem Artikel ist nicht mehr gültig. Werden Sie Republik-Mitglied für unbegrenzten Zugang.'
        uiComponent='gift-expired-paynote'
      />
    </EventTrackingContext>
  )
}
