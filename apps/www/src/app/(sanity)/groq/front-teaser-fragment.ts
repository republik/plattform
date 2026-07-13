import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { FRONT_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const FRONT_TEASER_FRAGMENT = /* groq */ `
  _type,
  "slug": slug.current,
  heading->{
    _id,
    "title": pt::text(title),
  },
  theme {
    name,
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
    textAlignment,
    textSize,
    color,
    backgroundColor,
    ${BYLINE_FRAGMENT},
  }
`

// Hack to not rely on the main query for types
const FRONT_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]][0]{
    ${FRONT_TEASER_FRAGMENT}
  }`,
)

export type FrontTeaserFragmentType = NonNullable<
  NonNullable<FRONT_TEASER_FRAGMENT_QUERY_RESULT>
>
