import { defineQuery } from 'next-sanity'

export const TEASER_QUERY = defineQuery(
  `*[(_type == "article" || _type == "page") && slug.current == $slug][0]{
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
