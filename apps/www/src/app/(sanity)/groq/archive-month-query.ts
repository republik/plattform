import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

// Each of the month's articles with its newest teaser, oldest article first.
// Articles without a teaser are dropped.
//
// Don't filter teasers by `target[0]->publishDate` instead: that dereferences
// every teaserLarge and takes ~14s, while `references()` uses the index.
export const ARCHIVE_MONTH_TEASERS_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishDate) &&
    coalesce(showInFeed, true) &&
    publishDate >= $from &&
    publishDate < $until
  ] | order(publishDate asc, _id asc) {
    "teaser": *[_type == "teaserLarge" && references(^._id)]
      | order(_updatedAt desc)[0] {
        ${TEASER_LARGE_FRAGMENT}
      }
  }[defined(teaser)].teaser`)
