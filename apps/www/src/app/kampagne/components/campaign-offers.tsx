'use client'

import { OfferOptionLabelOnly } from '@/app/kampagne/components/campaign-offer-options'
import NativeCta from '@app/components/paynotes/native-cta'
import { Button } from '@app/components/ui/button'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'
import { useState } from 'react'

type DiscountOption = {
  promoCode: `SPRING26-OFF${number}` | ''
  amount: number
  highlighted?: string
}

// There needs to be one Stripe promo code for each discounted amount. (Promo codes are named after the amount *off*, but we display the final amount in the UI)
const DISCOUNT_OPTIONS: DiscountOption[] = [
  { promoCode: 'SPRING26-OFF120', amount: 120, highlighted: '50 %' },
  { promoCode: 'SPRING26-OFF100', amount: 140 },
  { promoCode: 'SPRING26-OFF60', amount: 180 },
]

const radioContainerStyle = css({
  textAlign: 'center',
  px: '2',
  py: '3',
  border: '2px solid',
  borderColor: 'campaign26RadioOutline',
  borderRadius: '6',
  width: 'full',
  whiteSpace: 'nowrap',
  background: 'transparent',
  color: 'campaign26RadioText',
  cursor: 'pointer',
  position: 'relative',
  userSelect: 'none',
  _peerChecked: {
    background: 'campaign26RadioChecked',
    borderColor: 'campaign26RadioChecked',
    color: 'campaign26RadioTextChecked',
  },
  fontSize: '2xl',
  fontWeight: 'medium',
})

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [selectedPromoCode, setSelectedPromoCode] =
    useState<DiscountOption['promoCode']>(undefined)

  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isNativeApp } = usePlatformInformation()
  if (isNativeApp) {
    return <NativeCta />
  }

  const allHiddenParams = { ...utmParams, ...additionalShopParams }

  return (
    <form
      method='GET'
      action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot/YEARLY`}
      onSubmit={() => {
        trackEvent({
          action: `Go to YEARLY shop`,
        })
      }}
    >
      {Object.entries(allHiddenParams).map(([k, v]) => (
        <input type='hidden' hidden key={k} name={k} value={v} />
      ))}

      <div
        className={css({
          width: 'full',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: '2',
          mb: '4',
          md: { gap: '4', mb: '6' },
        })}
      >
        {DISCOUNT_OPTIONS.map(({ promoCode, amount, highlighted }) => {
          return (
            <OfferOptionLabelOnly
              key={promoCode || 'no-discount'}
              name={promoCode ? 'promo_code' : undefined}
              value={promoCode}
              checked={selectedPromoCode === promoCode}
              onChange={() => {
                setSelectedPromoCode(promoCode)
              }}
              className='peer'
            >
              <div key={promoCode} className={radioContainerStyle}>
                <span className={css({ display: 'block' })}>
                  <small
                    className={css({ fontWeight: 'normal', fontSize: 'xs' })}
                  >
                    CHF
                  </small>{' '}
                  <span>{amount}.–</span>
                </span>
                {highlighted && (
                  <span
                    className={css({
                      fontSize: 's',
                      lineHeight: 1,
                      position: 'absolute',
                      color: 'campaign26TagText',
                      background: 'campaign26Tag',
                      px: 2,
                      py: 1,
                      borderRadius: '2',
                      top: '-10px',
                      left: '10px',
                    })}
                  >
                    {highlighted}
                  </span>
                )}
              </div>
            </OfferOptionLabelOnly>
          )
        })}
      </div>

      <Button
        size='full'
        type='submit'
        className={css({
          background: 'campaign26Button',
          color: 'white',
        })}
      >
        Weiter
      </Button>
    </form>
  )
}
