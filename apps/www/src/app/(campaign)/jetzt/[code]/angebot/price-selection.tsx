'use client'

import { css } from '@app/styled-system/css'
import { PriceRewards } from './price-rewards'
import { PriceSliderWithState } from './price-slider-with-state'
import { CAMPAIGN_SLUG } from '@app/app/(campaign)/constants'
import { Logo } from '@app/app/(campaign)/components/logo'
import { useState } from 'react'

const getCheckoutUrl = ({
  price,
  referralCode,
}: {
  price: number
  referralCode: string
}): string => {
  const url = new URL('/angebote', process.env.NEXT_PUBLIC_BASE_URL)

  url.searchParams.set('price', `${price * 100}`)
  url.searchParams.set('referral_campaign', CAMPAIGN_SLUG)
  url.searchParams.set('referral_code', referralCode)
  // TODO: UTM params?

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
  referralCode: string
}

export default function PriceSelection({ referralCode }: PriceSelectionProps) {
  const [price, setPrice] = useState(240)

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
          href={getCheckoutUrl({ price, referralCode })}
          className={css({
            background: 'contrast',
            color: 'text.inverted',
            px: '6',
            py: '3',
            borderRadius: '4px',
            fontWeight: 'medium',
            cursor: 'pointer',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            // width: 'full',
            _hover: {},
          })}
        >
          Für CHF {price} abonnieren
        </a>
        <div className={css({ pt: '4' })}>
          <Logo />
        </div>
      </div>
    </>
  )
}
