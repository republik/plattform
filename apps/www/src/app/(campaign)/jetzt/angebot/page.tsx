import { Metadata } from 'next'
import PriceSelection from '../[code]/angebot/price-selection'

export const metadata: Metadata = {
  title: `Jemand lädt Sie ein, die Republik mit einem Abo zu unterstützen.`,
  description: 'Bis zum 31. März 2024 ab CHF 120 für ein Jahr.',
  robots: 'noindex',
}

export default async function Page() {
  return <PriceSelection />
}
