import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity' // Paged by cursor, not by slice offset: for performance reasons

// Paged by cursor, not by slice offset: for performance reasons
export const ARTICLES_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishDate) &&
    coalesce(showInFeed, true) &&
    (
      !defined($lastPublishDate) ||
      publishDate < $lastPublishDate ||
      (publishDate == $lastPublishDate && _id > $lastId)
    )
  ] | order(publishDate desc, _id asc) [0...$limit] {
    ${TEASER_SMALL_FRAGMENT}
  }`)
