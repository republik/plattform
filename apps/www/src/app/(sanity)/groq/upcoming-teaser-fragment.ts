import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { UPCOMING_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const UPCOMING_TEASER_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": coalesce(shortTitle, title),
  "description": coalesce(shortLead, description),
  "byline": coalesce(${BYLINE_FRAGMENT}, ^.${BYLINE_FRAGMENT}),
  image,
  publishDate,
  theme {
    name,
    accentColor,
  },
`

// Hack to not rely on the main query for types
const UPCOMING_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${UPCOMING_TEASER_FRAGMENT}
  }`,
)

export type UpcomingTeaserFragmentType =
  NonNullable<UPCOMING_TEASER_FRAGMENT_QUERY_RESULT>[number]
