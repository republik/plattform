import { CAROUSEL_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// TODO: rename shortLead to shortDescription to be consistent
export const CAROUSEL_TEASER_FRAGMENT = /* groq */ `
  _id,
  _type,
  title,
  description,
  slug,
  image,
  publishDate,
  heading->{
    _id,
    title,
    slug,
  },
  theme{
    accentColor
  },
`

// Hack to not rely on the main query for types
const CAROUSEL_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${CAROUSEL_TEASER_FRAGMENT}
  }`,
)

export type CarouselTeaserFragmentType =
  NonNullable<CAROUSEL_TEASER_FRAGMENT_QUERY_RESULT>[number]
