import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import PriceSelection from './price-selection'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

export default async function Page({ params }) {
  const data = await getInviteeData(params)

  const { sender } = data

  const referralCode = sender?.referralCode ?? params.code

  return <PriceSelection referralCode={referralCode} />
}
