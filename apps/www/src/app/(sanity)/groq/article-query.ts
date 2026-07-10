import { PORTABLE_TEXT_CONTENT_FRAGMENT } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { TEASER_FRAGMENT } from '@/app/(sanity)/groq/teaser-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    byline,
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
      image
    },
    articleRecommendations[]->{
      ${TEASER_FRAGMENT}
    }
  }`,
)
