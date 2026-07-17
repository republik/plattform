import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)][0...100]{
    ${TEASER_SMALL_FRAGMENT}
  }`)
