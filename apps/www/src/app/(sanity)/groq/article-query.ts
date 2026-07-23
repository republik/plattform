import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { PORTABLE_TEXT_CONTENT_FRAGMENT } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    ${BYLINE_FRAGMENT},
    cover {
      ...
    },
    heading->{
      _id,
      title,
      "slug": slug.current
    },
    newsletter->{
      title,
      description,
      frequency,
      image,
      name,
    },
    theme {
      name,
      accentColor,
      darkMode
    },
    ${PORTABLE_TEXT_CONTENT_FRAGMENT},
    readingAccess,
    contributors[]{
      _id,
      kind,
      "slug": contributor->userId,
      "name": contributor->title,
      "description": contributor->description,
      "portrait": contributor->portrait
    },
    "articleCollection": articleCollections[featured == true][0].collection->{
      _id,
      title,
      description,
      image,
      series
    },
    articleRecommendations[]->{
      ${TEASER_SMALL_FRAGMENT}
    }
  }`,
)
