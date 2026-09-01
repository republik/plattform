import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishDate) &&
    coalesce(showInFeed, true)
  ] | order(publishDate desc) [$start...$end] {
    ${TEASER_SMALL_FRAGMENT}
  }`)
