'use client'

import { css } from '@app/styled-system/css'
import { PriceRewards } from './price-rewards'
import { PriceSliderWithState } from './price-slider-with-state'
import { CAMPAIGN_SLUG } from '@app/app/(campaign)/constants'
import { Logo } from '@app/app/(campaign)/components/logo'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Link from 'next/link'

const useCheckoutUrl = ({
  price,
  referralCode,
}: {
  price: number
  referralCode?: string
}): string => {
  const pageSearchParams = useSearchParams()

  const url = new URL('/angebote', PUBLIC_BASE_URL)

  // Pass utm_* params to /angebote page
  for (const [k, v] of pageSearchParams) {
    if (k.startsWith('utm_')) {
      url.searchParams.set(k, v)
    }
  }

  url.searchParams.set('price', `${price * 100}`)
  url.searchParams.set('referral_campaign', CAMPAIGN_SLUG)
  if (referralCode) {
    url.searchParams.set('referral_code', referralCode)
  }

  if (price >= 1000) {
    url.searchParams.set('package', 'BENEFACTOR')
  } else if (price >= 240) {
    url.searchParams.set('package', 'ABO')
  } else {
    url.searchParams.set('package', 'YEARLY_ABO')
    url.searchParams.set('userPrice', '1')
  }

  return url.pathname + url.search
}

type PriceSelectionProps = {
  referralCode?: string
}

export default function PriceSelection({ referralCode }: PriceSelectionProps) {
  const [price, setPrice] = useState(240)
  const checkoutUrl = useCheckoutUrl({ price, referralCode })

  return (
    <>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
        })}
      >
        <PriceRewards price={price} />
      </div>

      <div
        className={css({
          position: 'sticky',
          bottom: 0,
          // width: '100dvw',
          py: '8',
          px: '8',
          mx: '-4',
          backgroundGradient: 'stickyBottomPanelBackground',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        })}
      >
        <PriceSliderWithState price={price} setPrice={setPrice} />
        <a
          href={checkoutUrl}
          className={css({
            background: 'contrast',
            color: 'text.inverted',
            px: '4',
            py: '3',
            borderRadius: '4px',
            fontWeight: 'medium',
            cursor: 'pointer',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            border: '2px solid token(colors.contrast)',
            // width: 'full',
            _hover: {
              background: 'text.inverted',
              color: 'contrast',
            },
          })}
        >
          Für CHF {price} abonnieren
        </a>
        <div className={css({ pt: '4' })}>
          <Link href='/' className={css({ textDecoration: 'none' })}>
            <Logo />
          </Link>
        </div>
      </div>
    </>
  )
}
