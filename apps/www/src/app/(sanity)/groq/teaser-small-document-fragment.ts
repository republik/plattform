import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_SMALL_DOCUMENT_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// Standalone teaser document, projected to the same shape as
// TEASER_SMALL_FRAGMENT so both can be rendered by the same components.
// Teasers have no own page: "href" resolves the first target (article/page
// reference or plain link) and is null when the teaser links nowhere.

// Duplication of color to maximise type compatibility with teaser-small-fragment
export const TEASER_SMALL_DOCUMENT_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": teaserSmallConfig.title,
  "description": teaserSmallConfig.description,
  "byline": teaserSmallConfig.${BYLINE_FRAGMENT},
  "href": select(
    target[0]->_type == "article" => target[0]->slug.current,
    target[0]->_type == "page" => target[0]->slug.current,
    defined(target[0].href) => target[0].href
  ),
  "image": teaserSmallConfig.image,
  publishDate,
  upcomingOnly,
  "targetPublishDate": target[0]->publishDate,
  "label": teaserSmallConfig.heading,
  "theme": {
    "accentColor": teaserSmallConfig.headingColor,
    "name": "EDITORIAL",
  },
  "color": teaserSmallConfig.color,
  "backgroundColor": teaserSmallConfig.backgroundColor,
  "headingColor": teaserSmallConfig.headingColor,
`

// Hack to not rely on the main query for types
const TEASER_SMALL_DOCUMENT_FRAGMENT_QUERY = defineQuery(
  `*[_type == "teaserSmall"]{
    ${TEASER_SMALL_DOCUMENT_FRAGMENT}
  }`,
)

export type TeaserSmallDocumentFragmentType =
  NonNullable<TEASER_SMALL_DOCUMENT_FRAGMENT_QUERY_RESULT>[number]
