import { defineQuery } from 'next-sanity'

export const SITEMAP_BY_YEAR_QUERY = defineQuery(`
  *[
    _type in ["article", "page"] &&
    defined(slug.current) &&
    defined(publishDate) &&
    publishDate >= $from && publishDate < $to
  ] | order(publishDate desc) {
    _type,
    "path": slug.current,
    "title": pt::text(title),
    publishDate,
    _updatedAt
  }`)
