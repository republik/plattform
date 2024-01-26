import { PriceRewards } from '@app/app/(campaign)/campaign-receiver/[code]/angebot/price-rewards'
import { PriceSliderWithState } from '@app/app/(campaign)/campaign-receiver/[code]/angebot/price-slider-with-state'
import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import { Suspense } from 'react'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

export default async function Page({ params, searchParams }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  const { sender } = data

  const isEligible = !['ABO', 'YEARLY_ABO', 'BENEFACTOR_ABO'].includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return <div>Noin, du hast schon ein Abo :P</div>
  }

  // if (!sender) {
  //   return <div>code hat nicht gefunzt</div>
  // }

  if (sender && data.me && sender?.id === data.me?.id) {
    return <div>das bin ja iiich</div>
  }

  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
          mt: '8-16',
          pr: '16',
        })}
      >
        Wählen Sie Ihren Preis
      </h1>
      <div
        className={css({
          flexGrow: 1,
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
          width: 'full',
          py: '8',
          background: 'pageBackground',
        })}
      >
        <Suspense>
          <PriceSliderWithState />
        </Suspense>
        <button
          className={css({
            background: 'contrast',
            color: 'text.inverted',
            p: '4',
            borderRadius: '5px',
            fontWeight: 'medium',
            cursor: 'pointer',
            display: 'block',
            width: 'full',
            _hover: {},
          })}
        >
          Jetz kaufen
        </button>
      </div>
    </>
  )
}
