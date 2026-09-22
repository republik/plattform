import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_BY_AUTHOR_PAGE_SIZE = 20

const CONTRIBUTOR_ARTICLES_FILTER = /* groq */ `
  _type == "article" &&
  defined(slug.current) &&
  defined(publishDate) &&
  references(^._id) &&
  ^._id in contributors[].contributor._ref
`

export const ARTICLES_BY_AUTHOR_QUERY = defineQuery(`
  *[_type == "contributor" && userId == $userId][0]{
    "articles": *[
      ${CONTRIBUTOR_ARTICLES_FILTER} &&
      (
        !defined($lastPublishDate) ||
        publishDate < $lastPublishDate ||
        (publishDate == $lastPublishDate && _id > $lastId)
      )
    ] | order(publishDate desc, _id asc) [0...$limit] {
      ${TEASER_SMALL_FRAGMENT}
    }
  }.articles`)

export const ARTICLES_BY_AUTHOR_COUNT_QUERY = defineQuery(`
  *[_type == "contributor" && userId == $userId][0]{
    "totalCount": count(*[${CONTRIBUTOR_ARTICLES_FILTER}])
  }.totalCount`)
