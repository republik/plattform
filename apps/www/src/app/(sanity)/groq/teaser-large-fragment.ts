import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_LARGE_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_LARGE_FRAGMENT = /* groq */ `
  _id,
  _type,
  "slug": slug.current,
  heading->{
    _id,
    "title": pt::text(title),
  },
  theme {
    name,
  },
  publishDate,
  "teaser": teaserLarge {
    layout,
    "title": coalesce(title, ^.title),
    "description": coalesce(description, ^.description),
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
const TEASER_LARGE_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]][0]{
    ${TEASER_LARGE_FRAGMENT}
  }`,
)

export type TeaserLargeFragmentType = NonNullable<
  NonNullable<TEASER_LARGE_FRAGMENT_QUERY_RESULT>
>
