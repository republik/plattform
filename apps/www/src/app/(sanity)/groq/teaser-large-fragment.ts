import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { TEASER_LARGE_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// teaserLarge is now its own document that references an article/page via
// target[0]. Its own fields are overrides; anything unset falls back to the
// referenced document. Output shape matches the previous fragment so the
// large-teaser components keep working unchanged.
export const TEASER_LARGE_FRAGMENT = /* groq */ `
  _id,
  _type,
  "targetType": target[0]->_type,
  // link can either be a plain link OR a referenced doc
  "target": coalesce(target[0]->slug.current, target[0].href),
  "targetId": target[0]->_id,
  "publishDate": target[0]->publishDate,
  "theme": {
    "name": target[0]->theme.name,
    "accentColor": target[0]->theme.accentColor,
  },
  // heading: own string override, else the referenced doc's format title
  "heading": select(
    defined(heading) => { "title": heading },
    defined(target[0]->heading) => {
      "title": pt::text(target[0]->heading->title)
    }
  ),
  "teaser": {
    layout,
    "title": coalesce(title, target[0]->title),
    "description": coalesce(description, target[0]->description),
    "byline": coalesce(${BYLINE_FRAGMENT}, target[0]->${BYLINE_FRAGMENT}),
    "image": coalesce(image, target[0]->image),
    imageCredits,
    imagePosition,
    imagePadding,
    textPosition,
    textAlignment,
    textSize,
    color,
    backgroundColor,
    // Audio always comes from the target article itself — a teaserLarge
    // override doc has no audio of its own.
    "audioTitle": pt::text(target[0]->title),
    "audioSourceMp3": target[0]->audioSourceMp3,
    "audioDurationMs": target[0]->audioDurationMs,
  }
`

// Hack to not rely on the main query for types
const TEASER_LARGE_FRAGMENT_QUERY = defineQuery(
  `*[_type == "teaserLarge"][0]{
    ${TEASER_LARGE_FRAGMENT}
  }`,
)

export type TeaserLargeFragmentType = NonNullable<
  NonNullable<TEASER_LARGE_FRAGMENT_QUERY_RESULT>
>
