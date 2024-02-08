import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { css } from '@app/styled-system/css'
import { Suspense } from 'react'
import { PriceRewards } from './price-rewards'
import { PriceSliderWithState } from './price-slider-with-state'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

export default async function Page({ params, searchParams }) {
  const data = await getInviteeData(params)

  const { sender } = data

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
        <button
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
          Für CHF {searchParams.price} abonnieren
        </button>
      </div>
    </>
  )
}
