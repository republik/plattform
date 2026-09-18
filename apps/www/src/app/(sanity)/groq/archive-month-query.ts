import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

// The archive shows only articles that were given a Front-Teaser.
//
// Those can't be filtered by their target's publish date directly —
// `target[0]->publishDate >= $from` dereferences every teaserLarge before it
// can filter, and takes ~14s on this dataset. That is why FRONT_FEED_QUERY is
// currently disabled on /front. Matching against a set of article ids through
// the reference index instead is ~50x faster, and the id set can be an inline
// subquery, so it stays one round trip.
const ARTICLE_IDS_IN_PERIOD = /* groq */ `
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishDate) &&
    coalesce(showInFeed, true) &&
    publishDate >= $from &&
    publishDate < $until
  ]._id
`

// Newest first so that the de-duplication in archive-teasers.ts keeps the most
// recent teaser when a piece was promoted to the front more than once.
//
// `references()` is unqualified on purpose: `target` is the only document
// reference a teaserLarge carries, and its image-asset refs can never collide
// with an article _id.
export const ARCHIVE_MONTH_TEASERS_QUERY = defineQuery(`
  *[_type == "teaserLarge" && references(${ARTICLE_IDS_IN_PERIOD})]
    | order(_updatedAt desc) {
      ${TEASER_LARGE_FRAGMENT}
    }`)

// Whether a month has anything to show. The navigation needs all twelve; run in
// parallel they cost ~0.5s against ~5.7s for one query spanning the year, since
// the reference lookup degrades sharply as the id set grows.
export const ARCHIVE_MONTH_TEASER_COUNT_QUERY = defineQuery(`
  count(*[_type == "teaserLarge" && references(${ARTICLE_IDS_IN_PERIOD})])`)
