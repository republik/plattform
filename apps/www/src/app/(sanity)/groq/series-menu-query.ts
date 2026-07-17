import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const SERIES_MENU_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    "articleCollection": articleCollections[featured == true][0].collection->{
      _id,
      title,
      description,
      image,
      series,
      "episodes": *[
        _type == "article" &&
        ^._id in articleCollections[].collection._ref
      ] | order(publishDate asc) {
        ${TEASER_SMALL_FRAGMENT}
      }
    },
  }`,
)
