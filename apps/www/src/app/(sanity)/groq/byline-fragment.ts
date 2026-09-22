import { BYLINE_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const BYLINE_FRAGMENT = /* groq */ `
  byline[] {
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "slug": select(
          reference->_type == "contributor" => "/~" + coalesce(reference->slug.current, reference->userId),
          reference->slug.current
        )
      }
    }
  }
`
// Hack to not rely on the main query for types
const BYLINE_FRAGMENT_QUERY = defineQuery(
  `*[_type == "article"][0]{
    ${BYLINE_FRAGMENT}
  }`,
)

export type BylineFragmentType = NonNullable<
  NonNullable<BYLINE_FRAGMENT_QUERY_RESULT>['byline']
>
