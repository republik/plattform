'use client'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { useState } from 'react'

import { FormField, RadioOption } from '../../ui/form'
import { Button } from '../../ui/button'

import IosCTA from '../ios-cta'

type OfferOptions = '1' | '9' | '22'

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('1')
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isIOSApp } = usePlatformInformation()
  if (isIOSApp) {
    return <IosCTA />
  }

  return (
    <form
      method='GET'
      action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot/MONTHLY`}
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
            width: 'full',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(50px,1fr))',
            gap: '4',
          })}
        >
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
              name='price_choice'
              value='1'
              checked={option === '1'}
              onChange={() => setOption('1')}
            >
              <span className={css({ display: 'block' })}>
                <small>CHF</small>{' '}
                <span className={css({ fontWeight: 'bold' })}>1.–</span>
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
              name='price_choice'
              value='9'
              checked={option === '9'}
              onChange={() => setOption('9')}
            >
              <span className={css({ display: 'block' })}>
                <small>CHF</small>{' '}
                <span className={css({ fontWeight: 'bold' })}>9.–</span>
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
              name='price_choice'
              value='22'
              checked={option === '22'}
              onChange={() => setOption('22')}
            >
              <span className={css({ display: 'block' })}>
                <small>CHF</small>{' '}
                <span className={css({ fontWeight: 'bold' })}>22.–</span>
              </span>
            </RadioOption>
          </div>
        </div>

        <FormField
          name='custom_price'
          label='Eigener Betrag'
          type='number'
          className={css({ width: 'full' })}
        />

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
