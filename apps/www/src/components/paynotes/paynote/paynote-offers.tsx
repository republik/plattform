'use client'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { useState } from 'react'

import { RadioOption } from '../../ui/form'
import { Button } from '../../ui/button'

import IosCTA from '../ios-cta'

type OfferOptions = 'MONTHLY' | 'YEARLY'

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('YEARLY')
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isIOSApp } = usePlatformInformation()
  if (isIOSApp) {
    return <IosCTA />
  }

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
      <input type='hidden' hidden name='promo_code' value='EINSTIEG' />
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
        <div
          className={css({
            textAlign: 'left',
            padding: '4',
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.3)',
            borderRadius: '6',
            width: 'full',
          })}
        >
          <RadioOption
            name='product'
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
        </div>
        <div
          className={css({
            textAlign: 'left',
            padding: '4',
            border: '2px solid',
            borderColor: 'rgba(0,0,0,0.3)',
            borderRadius: '6',
            width: 'full',
            background: 'background',
          })}
        >
          <RadioOption
            name='product'
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
                  backgroundColor: 'text.marketingAccent',
                  color: 'text.white',
                  fontWeight: 'medium',
                  px: '2',
                  borderRadius: '4px',
                  fontSize: 's',
                })}
              >
                12&thinsp;% günstiger als ein Monats-Abo
              </span>
            </span>
          </RadioOption>
        </div>

        <div
          className={css({
            fontSize: 's',
            textAlign: 'left',
            width: 'full',
          })}
        >
          {option === 'YEARLY'
            ? 'Unlimitierter Zugang. 240.– jährlich nach dem ersten Jahr. Jederzeit kündbar.'
            : 'Unlimitierter Zugang. 22.– monatlich nach dem ersten Monat. Jederzeit kündbar.'}
        </div>

        <Button type='submit'>Jetzt abonnieren</Button>
      </div>
    </form>
  )
}
