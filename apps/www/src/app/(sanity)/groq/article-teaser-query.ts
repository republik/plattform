import { FRONT_TEASER_FRAGMENT } from '@/app/(sanity)/groq/front-teaser-fragment'
import { defineQuery } from 'next-sanity'

export const TEASER_QUERY = defineQuery(
  `*[(_type == "article" || _type == "page") && slug.current == $slug][0]{
    ${FRONT_TEASER_FRAGMENT}
  }`,
)
