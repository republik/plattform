import { FRONT_TEASER_FRAGMENT } from '@/app/(sanity)/groq/front-teaser-fragment'
import { TEASER_BLOCK_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_BLOCK_FRAGMENT = defineQuery(
  `reference -> {
  ${FRONT_TEASER_FRAGMENT}
  }`,
)

// Hack to not rely on the main query for types
const TEASER_BLOCK_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "teaserItem"][0]{
      ${TEASER_BLOCK_FRAGMENT}
    }
  }`,
)

export type TeaserBlockFragmentType = NonNullable<
  NonNullable<TEASER_BLOCK_FRAGMENT_QUERY_RESULT>['block']
>
