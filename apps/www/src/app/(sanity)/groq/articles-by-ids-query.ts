import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const ARTICLES_BY_IDS_QUERY = defineQuery(`
  *[
    _type == "article" &&
    _id in $ids
  ] {
    ${TEASER_SMALL_FRAGMENT}
  }`)
