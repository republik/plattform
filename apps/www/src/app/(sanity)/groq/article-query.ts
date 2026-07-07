import { FEED_TEASER_FRAGMENT } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { PORTABLE_TEXT_CONTENT_FRAGMENT } from '@/app/(sanity)/groq/portable-text-content-fragment'
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
      darkMode,
      accentColor
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
    "articleCollection": articleCollections[0]->{
      _id,
      title,
      description,
      image
    },
    articleRecommendations[]->{
      ${FEED_TEASER_FRAGMENT}
    }
  }`,
)
