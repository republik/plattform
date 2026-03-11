'use client'

import { OfferOptionLabelOnly } from '@app/app/(campaign)/components/campaign-offer-options'
import NativeCta from '@app/components/paynotes/native-cta'
import { Button } from '@app/components/ui/button'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'
import { useState } from 'react'

type DiscountOption = {
  promoCode: `H25OFF${number}` | ''
  amount: number
  highlighted?: string
}

// There needs to be one Stripe promo code for each discounted amount. (Promo codes are named after the amount *off*, but we display the final amount in the UI)
const DISCOUNT_OPTIONS: DiscountOption[] = [
  { promoCode: 'H25OFF21', amount: 120, highlighted: '50%' },
  { promoCode: 'H25OFF13', amount: 180 },
  { promoCode: '', amount: 240 },
]

const radioContainerStyle = css({
  textAlign: 'center',
  px: '2',
  py: '3',
  border: '2px solid',
  borderColor: 'radioOutline',
  borderRadius: '6',
  width: 'full',
  whiteSpace: 'nowrap',
  background: 'transparent',
  color: 'radioText',
  _peerChecked: {
    background: 'radioChecked',
    borderColor: 'radioChecked',
    color: 'radioTextChecked',
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
      {selectedPromoCode ? (
        <input type='hidden' name='promo_code' value={selectedPromoCode} />
      ) : null}

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
        })}
      >
        {DISCOUNT_OPTIONS.map(({ promoCode, amount }) => {
          return (
            <OfferOptionLabelOnly
              key={promoCode}
              name='promo_code'
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
              </div>
            </OfferOptionLabelOnly>
          )
        })}
      </div>

      <Button
        size='full'
        type='submit'
        className={css({ background: 'button', color: 'white' })}
        disabled={selectedPromoCode === undefined}
      >
        Weiter
      </Button>
    </form>
  )
}
