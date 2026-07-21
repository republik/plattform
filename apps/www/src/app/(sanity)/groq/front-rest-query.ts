import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

// Collections whose articles never appear in the endless front feed.
export const FRONT_REST_EXCLUDED_COLLECTIONS = [
  'Briefings',
  'Kolumnen',
  'Newsletter',
]

// Articles published before the front's last teaserLarge ($before cursor),
// newest first, excluding the collections above. Paginated with $start/$end.
export const FRONT_REST_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(publishDate) &&
    publishDate < $before &&
    count(articleCollections[collection->title in $excludedCollections]) == 0
  ] | order(publishDate desc) [$start...$end] {
    ${TEASER_SMALL_FRAGMENT}
  }
`)
