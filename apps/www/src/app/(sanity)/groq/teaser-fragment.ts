import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": coalesce(shortTitle, title),
  "description": coalesce(shortLead, description),
  "slug": slug.current,
  image,
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
  ${BYLINE_FRAGMENT}
`

// Hack to not rely on the main query for types
const TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${TEASER_FRAGMENT}
  }`,
)

export type TeaserFragmentType =
  NonNullable<TEASER_FRAGMENT_QUERY_RESULT>[number]
