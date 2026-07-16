import { TEASER_FRAGMENT } from '@/app/(sanity)/groq/teaser-fragment'
import { defineQuery } from 'next-sanity'

export const SERIES_NAV_QUERY = defineQuery(
  `*[_type == "articleCollection" && _id == $id][0]{
    _id,
    title,
    description,
    image,
    slug,

    "episodes": *[_type == "article" && references(^._id)]{
      ${TEASER_FRAGMENT}
    }
  }`,
)
