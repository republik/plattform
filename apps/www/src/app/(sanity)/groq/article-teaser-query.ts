import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

// Preview a large teaser by the slug of the article/page it targets.
export const TEASER_LARGE_QUERY = defineQuery(
  `*[_type == "teaserLarge" && _id == $id][0]{
    ${TEASER_LARGE_FRAGMENT}
  }`,
)
