import { AUDIO_ITEM_FRAGMENT } from '@/app/(sanity)/groq/audio-queue-items-query'
import { CONTRIBUTORS_FRAGMENT } from '@/app/(sanity)/groq/contributors-fragment'
import { TEASER_SMALL_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_SMALL_FRAGMENT = /* groq */ `
  _id,
  _type,
  "title": coalesce(teaserSmall.title, title),
  "description": coalesce(teaserSmall.description, description),
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
  // Null for pages, which have no audio.
  audioDurationMs,
  "contributors": ${CONTRIBUTORS_FRAGMENT},
  _type == "article" => {
    "plainTitle": pt::text(coalesce(teaserSmall.title, title)),
    "audioItem": select(defined(audioSourceMp3) => @{
      ${AUDIO_ITEM_FRAGMENT}
    }),
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
