'use client'

import { Offers } from '@/app/components/paynotes/paynote/paynote-offers'
import {
  HERBST26_HEADLINE,
  isHerbst26Active,
} from '@/app/components/paynotes/herbst26'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import { useMe } from '@/lib/context/MeContext'
import { StructuredText } from 'react-datocms/structured-text'
import { getMeteringData } from '../article-metering'
import { usePaynotes } from '../paynotes-context'
import PaynoteAuthor from './paynote-author'
import { usePaynoteVariants } from './use-paynotes'

function PaynoteInline() {
  const { paynoteKind } = usePaynotes()
  const paynotes = usePaynoteVariants()
  const { trialStatus } = useMe()
  const isHerbst26 = isHerbst26Active()

  // During the Herbst-26 special the inline paynote runs alongside the overlay.
  if (paynoteKind !== 'PAYNOTE_INLINE' && paynoteKind !== 'HERBST26') {
    return null
  }

  // Outside the window this is exactly the previous `if (!paynotes)` guard.
  if (!isHerbst26 && !paynotes) {
    return null
  }

  const paynote = paynotes?.paynote

  // Herbst-26 special: fixed copy, the CMS paynote is not used and we don't
  // wait for it either.
  const showCmsPaynote = !isHerbst26 && !!paynote
  const title = isHerbst26 ? HERBST26_HEADLINE : paynote?.title

  // Both branches are literal css() calls so Panda can extract them statically.
  const accentBackground = isHerbst26
    ? css({ backgroundColor: 'text.marketingAccent' })
    : css({ backgroundColor: 'background.marketingAccent' })

  return (
    <EventTrackingContext category='PaynoteInline'>
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
          })}
        >
          {showCmsPaynote && <PaynoteAuthor author={paynote.author} />}

          <h2
            className={css({
              textStyle: { base: 'h3Serif', sm: 'h2Serif' },
              lineHeight: 1.4,
            })}
          >
            <span
              className={cx(
                accentBackground,
                css({
                  boxDecorationBreak: 'clone',
                  px: '1',
                  ml: '-0.5',
                  position: 'relative',
                }),
              )}
            >
              {title}
            </span>
          </h2>

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
              <StructuredText data={paynote?.message.value}></StructuredText>
            </div>
          ) : null}

          <Offers
            additionalShopParams={{
              // NOTE: the non-special value below is a pre-existing
              // copy-paste bug; during the special both surfaces are live at
              // once, so they have to be distinguishable.
              rep_ui_component: isHerbst26
                ? 'paynote-inline'
                : 'paynote-overlay',
              rep_paynote_title: title,
              rep_trial_status: trialStatus,
              ...getMeteringData('rep_'),
            }}
          />
        </div>
      </div>
    </EventTrackingContext>
  )
}

export default PaynoteInline
