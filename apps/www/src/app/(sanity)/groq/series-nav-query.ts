import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const SERIES_NAV_QUERY = defineQuery(
  `*[_type == "articleCollection" && _id == $id][0]{
    _id,
    title,
    description,
    image,
    slug,

    "episodes": *[
      _type == "article" &&
      ^._id in articleCollections[].collection._ref
    ] | order(publishDate asc) {
      ${TEASER_SMALL_FRAGMENT}
    }
  }`,
)
