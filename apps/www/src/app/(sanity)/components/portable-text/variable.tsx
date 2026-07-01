'use client'
import { useMe } from '@/lib/context/MeContext'
import type { Variable as VariableT } from '@/sanity.types'

export function Variable({ value }: { value: VariableT }) {
  const { meLoading, me } = useMe()

  if (meLoading) {
    return null
  }

  return <>{me?.[value.name]}</>
}
