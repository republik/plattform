import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'

export function WebOnly({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'webOnly' }>
}) {
  return <NestedPortableText value={value.body} />
}
