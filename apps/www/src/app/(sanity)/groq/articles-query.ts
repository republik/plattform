import { TEASER_FRAGMENT } from '@/app/(sanity)/groq/teaser-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)][0...100]{
    ${TEASER_FRAGMENT}
  }`)
