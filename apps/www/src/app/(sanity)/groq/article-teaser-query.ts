import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

// Preview a large teaser by the slug of the article/page it targets.
export const ARTICLE_TEASER_QUERY = defineQuery(
  `*[_type == "teaserLarge" && target[0]->slug.current == $slug][0]{
    ${TEASER_LARGE_FRAGMENT}
  }`,
)
