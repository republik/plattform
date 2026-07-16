import { UPCOMING_TEASER_FRAGMENT } from '@/app/(sanity)/groq/upcoming-teaser-fragment'
import { defineQuery } from 'next-sanity'

// Must be fetched with the server-only scheduledClient.
export const UPCOMING_TEASERS_QUERY = defineQuery(`
  *[
    _type == "article" &&
    $collectionId in articleCollections[].collection._ref &&
    defined(publishDate) && publishDate > now()
  ] | order(publishDate asc) [0...12] {
    ${UPCOMING_TEASER_FRAGMENT}
  }
`)
