import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import PriceSelection from './price-selection'
import { Metadata } from 'next'

// Ensure that search params are available during SSR
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = 'force-dynamic'

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const data = await getInviteeData(params)

  const senderName = data.sender?.firstName
    ? `${data.sender.firstName}${
        data.sender.lastName ? ' ' + data.sender.lastName : ''
      }`
    : 'Jemand'

  return {
    title: `${senderName} lädt Sie ein, die Republik mit einem Abo zu unterstützen.`,
    description: 'Bis zum 31. März 2024 ab CHF 120 für ein Jahr.',
    robots: 'noindex',
  }
}

export default async function Page(props) {
  const params = await props.params;
  const data = await getInviteeData(params)

  const { sender } = data

  const referralCode = sender?.referralCode ?? params.code

  return <PriceSelection referralCode={referralCode} />
}
