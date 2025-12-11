'use client'

import { Offers } from '@app/components/paynotes/paynote/paynote-offers'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useMe } from 'lib/context/MeContext'
import { StructuredText } from 'react-datocms/structured-text'
import { getMeteringData } from '../article-metering'
import { usePaynotes } from '../paynotes-context'
import PaynoteAuthor from './paynote-author'
import { usePaynoteVariants } from './use-paynotes'

function PaynoteInline() {
  const { paynoteKind } = usePaynotes()
  const paynotes = usePaynoteVariants()
  const { trialStatus } = useMe()

  if (paynoteKind !== 'PAYNOTE_INLINE') {
    return null
  }

  if (!paynotes) {
    return null
  }

  const { paynote } = paynotes

  const paynoteVariantForAnalytics = paynote.title

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
          <PaynoteAuthor author={paynote.author} />

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
                position: 'relative',
              })}
            >
              {paynote?.title}
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
            <StructuredText data={paynote?.message.value}></StructuredText>
          </div>

          <Offers
            additionalShopParams={{
              rep_ui_component: 'paynote-overlay',
              rep_paynote_title: paynoteVariantForAnalytics,
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
