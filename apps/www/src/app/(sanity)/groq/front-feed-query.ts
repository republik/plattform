import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

// teaserLarge documents referencing an article, ordered by the referenced
// article's publishDate, continuing below the oldest curated teaser ($before).
export const FRONT_FEED_QUERY = defineQuery(`
  *[
    _type == "teaserLarge" &&
    target[0]->_type == "article" &&
    defined(target[0]->publishDate) &&
    target[0]->publishDate < $before
  ] | order(target[0]->publishDate desc) [$start...$end] {
    ${TEASER_LARGE_FRAGMENT}
  }
`)
