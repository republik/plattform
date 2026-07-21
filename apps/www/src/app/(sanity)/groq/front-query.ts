import {
  TEASER_LARGE_FRAGMENT,
  type TeaserLargeFragmentType,
} from '@/app/(sanity)/groq/teaser-large-fragment'
import { TEASER_LIST_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import type { FRONT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// The front is a singleton-ish document; render the most recently published one.
export const FRONT_QUERY = defineQuery(
  `*[_type == "front"] | order(publishDate desc)[0]{
    _id,
    title,
    pageBuilder[]{
      _key,
      _type,
      _type == "teaserList" => {
        ${TEASER_LIST_BLOCK_FRAGMENT}
      },
      _type == "teaserLarge" => {
        "reference": @->{${TEASER_LARGE_FRAGMENT}}
      },
    }
  }`,
)

export type FrontBuilderBlock =
  | NonNullable<NonNullable<FRONT_QUERY_RESULT>['pageBuilder']>[number]
  // Manually add teaserLarge type because Sanity codegen can't infer reference types
  | {
      _key: string
      _type: 'teaserLarge'
      reference: TeaserLargeFragmentType
    }
