import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

export const TEASER_QUERY = defineQuery(
  `*[(_type == "article" || _type == "page") && slug.current == $slug][0]{
    ${TEASER_LARGE_FRAGMENT}
  }`,
)
