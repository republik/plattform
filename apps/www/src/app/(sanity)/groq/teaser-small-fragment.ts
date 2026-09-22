import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_SMALL_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

/* "heading": select(
  defined(teaserSmall.heading) || defined(heading) => {
  "_id": heading->_id,
    "title": coalesce(teaserSmall.heading, pt::text(heading->title)),
    "slug": heading->slug.current,
}
), */

export const TEASER_SMALL_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": coalesce(teaserSmall.title, title),
  "description": coalesce(teaserSmall.description, description),
  "byline": teaserSmall.${BYLINE_FRAGMENT},
  "slug": slug.current,
  "image": teaserSmall.image,
  publishDate,
  heading->{
    _id,
    "title": pt::text(title),
    "slug": slug.current
  },
  "articleCollection": articleCollections[featured == true][0].collection->{
    _id,
    title,
    series
  },
  "label": teaserSmall.heading,
  theme {
    name,
    accentColor,
  },
  "color": teaserSmall.color,
  "backgroundColor": teaserSmall.backgroundColor,
  "headingColor": teaserSmall.headingColor,
  // Top level rather than under the _type == "article" condition below: teaser
  // lists render a union of this and TEASER_SMALL_DOCUMENT_FRAGMENT, and a
  // field only present on one branch can't be read without narrowing first.
  // Null for pages, which have no audio.
  audioDurationMs,
  _type == "article" => {
    "plainTitle": pt::text(coalesce(teaserSmall.title, title)),
    audioSourceMp3,
    discussion->{
      backendDiscussionId,
    },
    inlineDiscussion,
  },
`

// Hack to not rely on the main query for types
const TEASER_SMALL_FRAGMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"]]{
    ${TEASER_SMALL_FRAGMENT}
  }`,
)

export type TeaserSmallFragmentType =
  NonNullable<TEASER_SMALL_FRAGMENT_QUERY_RESULT>[number]
