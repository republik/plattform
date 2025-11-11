'use client'

import GoogleCTA from '@app/components/paynotes/google-cta'

import IosCTA from '@app/components/paynotes/ios-cta'
import { OfferOptionLabelOnly } from '@app/components/paynotes/offer-options'
import { Button } from '@app/components/ui/button'
import { FormField } from '@app/components/ui/form'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'
import { token } from '@republik/theme/tokens'
import { useState } from 'react'

type DiscountOption = {
  promoCode: `H25OFF${number}` | ''
  amount: number
  showAsButton?: boolean
}

// There needs to be one Stripe promo code for each discounted amount. (Promo codes are named after the amount *off*, but we display the final amount in the UI)
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

const radioContainerStyle = css({
  textAlign: 'center',
  px: '2',
  py: '3',
  border: '2px solid',
  borderColor: 'rgba(0,0,0,0.3)',
  borderRadius: '6',
  width: 'full',
  background: 'background.marketing',
  whiteSpace: 'nowrap',
  _peerChecked: {
    background: 'background',
    borderColor: 'text',
  },
  fontSize: '2xl',
  fontWeight: 'medium',
})

const inputContainerStyle = css({
  width: 'full',
  px: '4',
  py: '2',
  fontSize: 'xs',
  borderWidth: '2px',
  textAlign: 'center',
  borderColor: 'rgba(0,0,0,0.3)',
  borderRadius: '6',
  background: 'transparent',
  display: 'flex',
  alignItems: 'baseline',

  _focusWithin: {
    borderColor: 'text',
    background: 'background',
  },
})

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [selectedPromoCode, setSelectedPromoCode] =
    useState<DiscountOption['promoCode']>(undefined)
  const [customAmount, setCustomAmount] = useState<number | undefined>()

  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isIOSApp, isAndroidApp } = usePlatformInformation()
  if (isIOSApp) {
    return <IosCTA />
  }

  if (isAndroidApp) {
    return <GoogleCTA />
  }

  const allHiddenParams = { ...utmParams, ...additionalShopParams }

  return (
    <form
      method='GET'
      action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot/MONTHLY`}
      onSubmit={() => {
        trackEvent({
          action: `Go to MONTHLY shop`,
        })
      }}
    >
      {
        // Only include hidden input when custom amount is used and a promo code is found
        // Otherwise the promo_code value is used from the OfferOption below
        customAmount && selectedPromoCode ? (
          <input type='hidden' name='promo_code' value={selectedPromoCode} />
        ) : null
      }

      {Object.entries(allHiddenParams).map(([k, v]) => (
        <input type='hidden' hidden key={k} name={k} value={v} />
      ))}

      <div
        data-theme='light'
        className={css({
          display: 'flex',
          gap: '4',
          flexDir: 'column',
          textStyle: 'body',
          // alignItems: 'center',
        })}
      >
        <p
          className={css({
            color: 'textSoft',
            fontSize: 's',
          })}
        >
          Wählen Sie einen Betrag aus:
        </p>

        <div
          className={css({
            width: 'full',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: '2',
          })}
        >
          {DISCOUNT_OPTIONS.flatMap(({ promoCode, amount, showAsButton }) => {
            return showAsButton ? (
              <OfferOptionLabelOnly
                key={promoCode}
                name='promo_code'
                value={promoCode}
                checked={
                  selectedPromoCode === promoCode && customAmount === undefined
                }
                onChange={() => {
                  setSelectedPromoCode(promoCode)
                  setCustomAmount(undefined)
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
            ) : (
              []
            )
          })}
        </div>

        <div
          className={inputContainerStyle}
          style={{
            background: customAmount ? token('colors.background') : undefined,
            borderColor: customAmount ? token('colors.text') : undefined,
          }}
        >
          <span>CHF</span>

          <FormField
            name='custom_price'
            label='Eigener Betrag'
            hideLabel
            placeholder='Preis Ihrer Wahl'
            type='number'
            min={1}
            max={22}
            className={css({
              width: 'full',
              border: 'none',
              outline: 'none',
              fontSize: 'xl',
              background: 'transparent',
            })}
            value={customAmount ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.valueAsNumber
              if (isNaN(value)) {
                setCustomAmount(undefined)
                setSelectedPromoCode(undefined)
              } else {
                setCustomAmount(value)
                const promoCode = DISCOUNT_OPTIONS.find(
                  (offer) => offer.amount === value,
                )?.promoCode
                setSelectedPromoCode(promoCode)
              }
            }}
          />
        </div>

        <Button size='full' type='submit'>
          Weiter
        </Button>

        <p
          className={css({
            fontSize: 's',
            textAlign: 'center',
          })}
        >
          Ab dem zweiten Monat CHF 22.– pro Monat.
          <br />
          Wir informieren Sie vor der Verlängerung per{' '}
          <span className={css({ whiteSpace: 'nowrap' })}>E-Mail</span>.<br />
          <span
            className={css({
              fontWeight: 'medium',
            })}
          >
            Jederzeit kündbar.
          </span>
        </p>

        <p
          className={css({
            fontSize: 's',
            color: 'textSoft',
            textAlign: 'center',
          })}
        >
          Dieses Angebot läuft bis und mit 28.09.2025.
        </p>
      </div>
    </form>
  )
}
