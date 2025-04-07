'use client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { css } from '@republik/theme/css'
import { useState } from 'react'

import { RadioOption } from '../ui/form'

type OfferOptions = 'MONTHLY' | 'YEARLY'

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('YEARLY')

  const utmParams = getUTMSessionStorage()

  const trackEvent = useTrackEvent()

  return (
    <form
      method='GET'
      action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
      onSubmit={() => {
        trackEvent({
          action: `Go to ${option} shop`,
        })
      }}
    >
      {Object.entries(utmParams).map(([k, v]) => {
        return <input type='hidden' hidden key={k} name={k} value={v} />
      })}
      {Object.entries(additionalShopParams).map(([k, v]) => {
        return <input type='hidden' hidden key={k} name={k} value={v} />
      })}
      <div
        className={css({
          display: 'flex',
          gap: '4',
          flexDir: 'column',
          textStyle: 'body',
          alignItems: 'center',
        })}
      >
        <RadioOption
          name='MONTHLY'
          value='MONTHLY'
          checked={option === 'MONTHLY'}
          onChange={() => setOption('MONTHLY')}
        >
          <span className={css({ display: 'block' })}>
            <del
              className={css({
                color: 'textSoft',
                fontWeight: 'medium',
                mr: '1',
              })}
            >
              22.–
            </del>
            <span className={css({ fontWeight: 'bold' })}>
              11.– für einen Monat
            </span>
          </span>
        </RadioOption>
        <RadioOption
          name='YEARLY'
          value='YEARLY'
          checked={option === 'YEARLY'}
          onChange={() => setOption('YEARLY')}
        >
          <span
            className={css({ display: 'flex', gap: '2', flexDir: 'column' })}
          >
            <span>
              <del
                className={css({
                  color: 'textSoft',
                  fontWeight: 'medium',
                  mr: '1',
                })}
              >
                240.–
              </del>
              <span className={css({ fontWeight: 'bold' })}>
                222.– für ein Jahr
              </span>
            </span>
            <span
              className={css({
                backgroundColor: '#FDE047',
                color: 'text.black',
                px: '1',
                borderRadius: '2px',
                fontSize: 's',
              })}
            >
              12&thinsp;% günstiger als ein Monats-Abo
            </span>
          </span>
        </RadioOption>

        <div
          className={css({
            fontSize: 's',
          })}
        >
          {option === 'YEARLY'
            ? 'Unlimitierter Zugang. 240.– jährlich nach dem ersten Jahr. Jederzeit kündbar.'
            : 'Unlimitierter Zugang. 22.– monatlich nach dem ersten Monat. Jederzeit kündbar.'}
        </div>

        <button
          type='submit'
          className={css({
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            fontSize: 'l',
            lineHeight: '1',
            fontWeight: 'medium',
            whiteSpace: 'nowrap',
            px: '6',
            py: '3',
            background: 'text',
            color: 'text.inverted',
            mt: '2',
            cursor: 'pointer',
          })}
        >
          Jetzt abonnieren
        </button>
      </div>
    </form>
  )
}
