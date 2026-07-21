import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

export const FRONT_REST_EXCLUDED_COLLECTIONS = [
  'Briefings',
  'Kolumnen',
  'Newsletter',
]

export const FRONT_REST_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(publishDate) &&
    publishDate < $before &&
    coalesce(count(articleCollections[collection->title in $excludedCollections]), 0) == 0
  ] | order(publishDate desc) [$start...$end] {
    ${TEASER_LARGE_FRAGMENT}
  }
`)
