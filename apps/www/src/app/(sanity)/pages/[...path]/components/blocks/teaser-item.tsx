import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { Teaser, teaserFragment } from './teaser'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

export type TeaserItemBlock = Extract<PageBuilderBlock, { _type: 'teaserItem' }>

/** GROQ projection for the `teaserItem` block. */
export const teaserItemFragment = /* groq */ `
  _type == "teaserItem" => {
    reference->{
      ${teaserFragment}
    }
  }
`

/** A single teaser linking to a referenced article or page. */
export function TeaserItem({ block }: { block: TeaserItemBlock }) {
  if (!block.reference) {
    return null
  }
  return <Teaser teaser={block.reference} />
}
