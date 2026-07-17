import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_SMALL_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_SMALL_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": coalesce(teaserSmall.title, title),
  "description": coalesce(teaserSmall.description, description),
  "byline": coalesce(teaserSmall.${BYLINE_FRAGMENT}, ${BYLINE_FRAGMENT}),
  "slug": slug.current,
  "image": teaserSmall.image,
  publishDate,
  heading->{
    _id,
    "title": pt::text(title),
    "slug": slug.current,
  },
  theme {
    name,
    accentColor,
  },
`

// Hack to not rely on the main query for types
const TEASER_SMALL_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${TEASER_SMALL_FRAGMENT}
  }`,
)

export type TeaserFragmentType =
  NonNullable<TEASER_SMALL_FRAGMENT_QUERY_RESULT>[number]
