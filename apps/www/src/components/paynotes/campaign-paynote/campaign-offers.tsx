'use client'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { useState } from 'react'

import { FormField, RadioOption } from '../../ui/form'
import { Button } from '../../ui/button'

import IosCTA from '../ios-cta'
import { token } from '@republik/theme/tokens'

type OfferOptions = 'H25OFF21' | 'H25OFF13' | ''

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('H25OFF13')
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
            style={{
              background:
                option === 'H25OFF21'
                  ? token('colors.background')
                  : token('colors.background.marketing'),
            }}
          >
            <RadioOption
              name='promo_code'
              value='H25OFF21'
              checked={option === 'H25OFF21'}
              onChange={() => setOption('H25OFF21')}
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
            style={{
              background:
                option === 'H25OFF13'
                  ? token('colors.background')
                  : token('colors.background.marketing'),
            }}
          >
            <RadioOption
              name='promo_code'
              value='H25OFF13'
              checked={option === 'H25OFF13'}
              onChange={() => setOption('H25OFF13')}
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
            style={{
              background:
                option === ''
                  ? token('colors.background')
                  : token('colors.background.marketing'),
            }}
          >
            <RadioOption
              name='promo_code'
              value=''
              checked={option === ''}
              onChange={() => setOption('')}
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
          Unlimitierter Zugang. 22.– monatlich nach dem ersten Monat. Jederzeit
          kündbar.
        </div>

        <Button type='submit'>Jetzt abonnieren</Button>
      </div>
    </form>
  )
}
