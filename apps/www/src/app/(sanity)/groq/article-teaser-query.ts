import { defineQuery } from 'next-sanity'

export const ARTICLE_TEASER_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _type,
    "slug": slug.current,
    contributors[]{
      kind,
      "name": contributor->title,
    },
    "teaser": frontTeaser {
      layout,
      title,
      lead,
      image,
      imageCredits,
      imagePosition,
      imagePadding,
      textPosition,
      textSize,
      color,
      backgroundColor
    }
  }`,
)
