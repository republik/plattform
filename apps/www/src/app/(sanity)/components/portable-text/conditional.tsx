'use client'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import { useMe } from '@/lib/context/MeContext'
import type { If, IfNot } from '@/sanity.types'

export function Conditional({ value }: { value: If | IfNot }) {
  const { meLoading, hasAccess } = useMe()

  if (meLoading) {
    return null
  }

  // TODO: exhaustively check for conditions
  let conditionIsSatisfied: boolean
  switch (value.present) {
    case 'hasAccess':
      conditionIsSatisfied = value._type === 'if' ? hasAccess : !hasAccess
      break
    default:
      conditionIsSatisfied = true
  }

  return conditionIsSatisfied ? <NestedPortableText value={value.body} /> : null
}
