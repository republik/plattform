'use client'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/portable-text-renderers'
import { useMe } from '@/lib/context/MeContext'
import type { If, IfNot } from '@/sanity.types'

export function Conditional({ value }: { value: If | IfNot }) {
  const { meLoading, hasActiveMembership } = useMe()

  if (meLoading) {
    return null
  }

  // TODO: exhaustively check for conditions
  let conditionIsSatisfied: boolean
  switch (value.present) {
    case 'hasActiveMembership':
      conditionIsSatisfied =
        value._type === 'if' ? hasActiveMembership : !hasActiveMembership
      break
    default:
      conditionIsSatisfied = true
  }

  return conditionIsSatisfied ? <NestedPortableText value={value.body} /> : null
}
