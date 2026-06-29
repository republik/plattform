import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import type { WebOnly } from '@/sanity.types'

export function WebOnly({ value }: { value: WebOnly }) {
  return <NestedPortableText value={value.body} />
}
