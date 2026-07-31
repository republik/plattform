import { TEASER_SMALL_DOCUMENT_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-document-fragment'
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
      (
        _type == "article" &&
        ^._id in articleCollections[].collection._ref
      ) || (
        _type == "teaserSmall" &&
        collection._ref == ^._id
      )
    ] | order(publishDate asc) {
      _type == "article" => {
        ${TEASER_SMALL_FRAGMENT}
      },
      _type == "teaserSmall" => {
        ${TEASER_SMALL_DOCUMENT_FRAGMENT}
      }
    }
  }`,
)
