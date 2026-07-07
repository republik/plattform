import { FEED_TEASER_FRAGMENT } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)][0...100]{
    ${FEED_TEASER_FRAGMENT}
  }`)
