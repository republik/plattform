'use client'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import { useMe } from '@/lib/context/MeContext'
import type { If, IfNot } from '@/sanity.types'

export function Conditional({ value }: { value: If | IfNot }) {
  const { meLoading, hasAccess, me } = useMe()

  if (meLoading) {
    return null
  }

  // Flip the condition that's checked for when the type is "ifNot"
  const getCondition = (cond: boolean) =>
    value._type === 'ifNot' ? !cond : cond

  // TODO: exhaustively check for conditions
  let conditionIsSatisfied: boolean
  switch (value.present) {
    case 'hasAccess':
      conditionIsSatisfied = getCondition(hasAccess)
      break
    case 'lastName':
      conditionIsSatisfied = getCondition(!!me?.lastName)
      break
    default:
      // Make sure all cases are handled
      value.present satisfies never
  }

  return conditionIsSatisfied ? <NestedPortableText value={value.body} /> : null
}
