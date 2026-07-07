import { FEED_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// Fields-only fragment: interpolate inside a projection over articles/pages,
// e.g. `articleRecommendations[]->{ ${FEED_TEASER_FRAGMENT} }`.
export const FEED_TEASER_FRAGMENT = /* groq */ `
  _id,
  _type,
  title,
  description,
  slug,
  heading->{
    _id,
    title,
    slug,
  },
  theme{
    accentColor
  },
  contributors[]{
    kind,
    "name": contributor->title,
  }
`

// Hack to not rely on the main query for types: evaluate the fragment against
// article and page documents (teaser references can point to either) so
// TypeGen infers the correct union type.
const FEED_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${FEED_TEASER_FRAGMENT}
  }`,
)

export type FeedTeaserFragmentType =
  NonNullable<FEED_TEASER_FRAGMENT_QUERY_RESULT>[number]
