import { FEED_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const FEED_TEASER_FRAGMENT = /* groq */ `
  _id,
  _type,
  title,
  description,
  slug,
  image,
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

// Hack to not rely on the main query for types
const FEED_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${FEED_TEASER_FRAGMENT}
  }`,
)

export type FeedTeaserFragmentType =
  NonNullable<FEED_TEASER_FRAGMENT_QUERY_RESULT>[number]
