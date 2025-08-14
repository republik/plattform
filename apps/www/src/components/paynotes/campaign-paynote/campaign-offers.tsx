'use client'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { useState } from 'react'

import { FormField, RadioOption } from '../../ui/form'
import { Button } from '../../ui/button'

import IosCTA from '../ios-cta'

type DiscountOption = {
  promoCode: `H25OFF${number}` | ''
  amount: number
  showAsButton?: boolean
}

const DISCOUNT_OPTIONS: DiscountOption[] = [
  { promoCode: 'H25OFF21', amount: 1, showAsButton: true },
  { promoCode: 'H25OFF20', amount: 2 },
  { promoCode: 'H25OFF19', amount: 3 },
  { promoCode: 'H25OFF18', amount: 4 },
  { promoCode: 'H25OFF17', amount: 5 },
  { promoCode: 'H25OFF16', amount: 6 },
  { promoCode: 'H25OFF15', amount: 7 },
  { promoCode: 'H25OFF14', amount: 8 },
  { promoCode: 'H25OFF13', amount: 9, showAsButton: true },
  { promoCode: 'H25OFF12', amount: 10 },
  { promoCode: 'H25OFF11', amount: 11 },
  { promoCode: 'H25OFF10', amount: 12 },
  { promoCode: 'H25OFF09', amount: 13 },
  { promoCode: 'H25OFF08', amount: 14 },
  { promoCode: 'H25OFF07', amount: 15 },
  { promoCode: 'H25OFF06', amount: 16 },
  { promoCode: 'H25OFF05', amount: 17 },
  { promoCode: 'H25OFF04', amount: 18 },
  { promoCode: 'H25OFF03', amount: 19 },
  { promoCode: 'H25OFF02', amount: 20 },
  { promoCode: 'H25OFF01', amount: 21 },
  { promoCode: '', amount: 22, showAsButton: true },
]

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<DiscountOption['promoCode']>('H25OFF13')
  const [customAmount, setCustomAmount] = useState<number | undefined>()

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
      {customAmount && <input type='hidden' name='promo_code' value={option} />}

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
          {DISCOUNT_OPTIONS.flatMap(({ promoCode, amount, showAsButton }) => {
            return showAsButton ? (
              <RadioOption
                key={promoCode}
                name='promo_code'
                value={promoCode}
                checked={option === promoCode && customAmount === undefined}
                onChange={() => {
                  setOption(promoCode)
                  setCustomAmount(undefined)
                }}
                hideRadio
                className='peer'
              >
                <div key={promoCode} className={radioContainerStyles}>
                  <span className={css({ display: 'block' })}>
                    <small>CHF</small>{' '}
                    <span className={css({ fontWeight: 'bold' })}>
                      {amount}.–
                    </span>
                  </span>
                </div>
              </RadioOption>
            ) : (
              []
            )
          })}
        </div>

        <FormField
          name='custom_price'
          label='Eigener Betrag'
          type='number'
          min={1}
          max={22}
          className={css({ width: 'full' })}
          value={customAmount ?? ''}
          onChange={(e) => {
            const value = e.currentTarget.valueAsNumber
            if (!isNaN(value)) {
              setCustomAmount(value)
              const promoCode = DISCOUNT_OPTIONS.find(
                (offer) => offer.amount === value,
              )?.promoCode
              if (promoCode) {
                setOption(promoCode)
              }
            }
          }}
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
