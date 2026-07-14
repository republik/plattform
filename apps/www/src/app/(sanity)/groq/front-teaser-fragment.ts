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
    "title": coalesce(title, ^.title),
    "lead": coalesce(lead, ^.lead),
    "byline": coalesce(${BYLINE_FRAGMENT}, ^.${BYLINE_FRAGMENT}),
    image,
    imageCredits,
    imagePosition,
    imagePadding,
    textPosition,
    textAlignment,
    textSize,
    color,
    backgroundColor,
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
