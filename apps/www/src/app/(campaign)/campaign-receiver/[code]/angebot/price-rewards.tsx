'use client'

import { useSearchParams } from 'next/navigation'

export const PriceRewards = () => {
  const searchParams = useSearchParams()

  const price = searchParams.get('price')

  return <>Der Preis ist heiss, nämlich {price}</>
}
