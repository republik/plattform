import { defineQuery } from 'next-sanity'

export const FEED_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishDate) &&
    coalesce(showInFeed, true)
  ] | order(publishDate desc) [0...100] {
    _id,
    "path": slug.current,
    "title": pt::text(title),
    "description": pt::text(description),
    publishDate
  }`)
