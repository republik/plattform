import type { FRONT_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const FRONT_TEASER_FRAGMENT = defineQuery(`
  _type,
  "slug": slug.current,
  heading->{
    _id,
    title,
    slug,
  },
  theme {
    titleFont,
    accentColor
  },
  contributors[]{
    kind,
    "name": contributor->title,
  },
  "teaser": frontTeaser {
    layout,
    title,
    lead,
    image,
    imageCredits,
    imagePosition,
    imagePadding,
    textPosition,
    textSize,
    color,
    backgroundColor
  }
`)

// Hack to not rely on the main query for types
const FRONT_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]][0]{
    ${FRONT_TEASER_FRAGMENT}
  }`,
)

export type FrontTeaserFragmentType = NonNullable<
  NonNullable<FRONT_TEASER_FRAGMENT_QUERY_RESULT>
>
