import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { getSliderStepForValue } from '@app/app/(campaign)/jetzt/[code]/angebot/price-slider/helpers'
import PriceSelection from './price-selection'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

export default async function Page({ params, searchParams }) {
  const data = await getInviteeData(params)

  const { sender } = data

  const referralCode = sender?.referralCode ?? params.code

  const price = getSliderStepForValue(+searchParams.price).value

  return <PriceSelection initialPrice={price} referralCode={referralCode} />
}
