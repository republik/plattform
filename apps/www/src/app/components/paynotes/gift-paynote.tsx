'use client'

import { Offers } from '@/app/components/paynotes/paynote/paynote-offers'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { usePaynotes } from './paynotes-context'
import { useGiftAccess } from './use-gift-access'

function GiftPaynote() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'GIFT_PAYNOTE') {
    return null
  }

  return (
    <EventTrackingContext category='GiftPaynote'>
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
          <GiftGranterInfo />
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
              pb: '4',
              fontSize: 18,
            })}
          >
            <p>
              Gefällt Ihnen, was Sie lesen? Werden Sie Mitglied und erhalten
              Sie unbegrenzten Zugang zu allen Artikeln.
            </p>
          </div>
          <Offers
            additionalShopParams={{
              rep_ui_component: 'gift-paynote',
            }}
          />
        </div>
      </div>
    </EventTrackingContext>
  )
}

function GiftGranterInfo() {
  const { granterName, granterPortrait, hasPublicProfile } = useGiftAccess()

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        alignItems: 'center',
        gap: '3',
      })}
    >
      {hasPublicProfile && granterPortrait && (
        <img
          src={granterPortrait}
          alt={granterName || ''}
          className={css({
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            objectFit: 'cover',
          })}
        />
      )}
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
          {hasPublicProfile && granterName
            ? `Dieser Artikel wurde Ihnen von ${granterName} geschenkt`
            : 'Dieser Artikel wurde Ihnen geschenkt'}
        </span>
      </h2>
    </div>
  )
}

export function GiftInlineBanner() {
  const { paynoteKind } = usePaynotes()
  const { granterName, hasPublicProfile } = useGiftAccess()

  if (paynoteKind !== 'GIFT_PAYNOTE') {
    return null
  }

  const message =
    hasPublicProfile && granterName
      ? `Dieser Artikel wurde Ihnen von ${granterName} geschenkt.`
      : 'Dieser Artikel wurde Ihnen geschenkt.'

  return (
    <div
      data-theme='light'
      className={css({
        background: 'background.marketingAccent',
        color: 'text',
        padding: '4 6',
        textAlign: 'center',
        textStyle: 'sansSerifRegular',
        fontSize: 'base',
        lineHeight: 1.5,
      })}
    >
      {message} Viel Vergnügen bei der Lektüre.
    </div>
  )
}

export function GiftExpiredPaynote() {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'GIFT_EXPIRED') {
    return null
  }

  return (
    <EventTrackingContext category='GiftExpiredPaynote'>
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
              Dieser Geschenk-Link ist abgelaufen
            </span>
          </h2>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
              pb: '4',
              fontSize: 18,
            })}
          >
            <p>
              Der Zugang zu diesem Artikel ist nicht mehr gültig. Werden Sie
              Republik-Mitglied für unbegrenzten Zugang.
            </p>
          </div>
          <Offers
            additionalShopParams={{
              rep_ui_component: 'gift-expired-paynote',
            }}
          />
        </div>
      </div>
    </EventTrackingContext>
  )
}

export default GiftPaynote
