import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import type { Html } from '@/sanity.types'

export function Html({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'html' }>
}) {
  return <div dangerouslySetInnerHTML={{ __html: value.html }}></div>
}
