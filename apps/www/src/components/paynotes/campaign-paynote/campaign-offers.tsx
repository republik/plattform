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

type Offer = {
  value: 'H25OFF21' | 'H25OFF13' | ''
  price: string
}

const OFFERS: Offer[] = [
  { value: 'H25OFF21', price: '1.–' },
  { value: 'H25OFF13', price: '9.–' },
  { value: '', price: '22.–' },
]

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<Offer['value']>('H25OFF13')
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isIOSApp } = usePlatformInformation()
  if (isIOSApp) {
    return <IosCTA />
  }

  const allHiddenParams = { ...utmParams, ...additionalShopParams }

  const radioContainerStyles = css({
    textAlign: 'left',
    padding: '4',
    border: '2px solid',
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: '6',
    width: 'full',
    background: 'background.marketing',
    _peerChecked: {
      background: 'background',
      borderColor: 'text.marketingAccent',
    },
  })

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
      {Object.entries(allHiddenParams).map(([k, v]) => (
        <input type='hidden' hidden key={k} name={k} value={v} />
      ))}

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
          {OFFERS.map(({ value, price }) => (
            <RadioOption
              key={value}
              name='promo_code'
              value={value}
              checked={option === value}
              onChange={() => setOption(value)}
              hideRadio
              className='peer'
            >
              <div key={value} className={radioContainerStyles}>
                <span className={css({ display: 'block' })}>
                  <small>CHF</small>{' '}
                  <span className={css({ fontWeight: 'bold' })}>{price}</span>
                </span>
              </div>
            </RadioOption>
          ))}
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
