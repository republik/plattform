import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { css } from '@app/styled-system/css'
import { Suspense } from 'react'
import { PriceRewards } from './price-rewards'
import { PriceSliderWithState } from './price-slider-with-state'
import Link from 'next/link'
import { getSliderStepForValue } from '@app/app/(campaign)/jetzt/[code]/angebot/price-slider/helpers'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

const getCheckoutUrl = ({
  price,
  referralCode,
}: {
  price: number
  referralCode: string
}): string => {
  const url = new URL('/angebote', process.env.NEXT_PUBLIC_BASE_URL)

  url.searchParams.set('price', `${price * 100}`)
  url.searchParams.set('referral_campaign', 'TODO')
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

export default async function Page({ params, searchParams }) {
  const data = await getInviteeData(params)

  const { sender } = data

  const referralCode = sender?.referralCode ?? params.code

  const price = getSliderStepForValue(+searchParams.price).value

  return (
    <>
      {/* <h1
        className={css({
          textStyle: 'campaignHeading',
          mt: '8-16',
          pr: '16',
        })}
      >
        Wählen Sie Ihren Einstiegspreis
      </h1> */}
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
          mt: '8-16',
        })}
      >
        <Suspense>
          <PriceRewards />
        </Suspense>
      </div>

      <div
        className={css({
          position: 'sticky',
          bottom: 0,
          // width: '100dvw',
          pb: '8',
          px: '8',
          mx: '-4',
          backgroundGradient: 'stickyBottomPanelBackground',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        })}
      >
        <Suspense>
          <PriceSliderWithState />
        </Suspense>
        <Link
          href={getCheckoutUrl({ price, referralCode })}
          className={css({
            background: 'contrast',
            color: 'text.inverted',
            px: '6',
            py: '3',
            borderRadius: '3px',
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
        </Link>
      </div>
    </>
  )
}
