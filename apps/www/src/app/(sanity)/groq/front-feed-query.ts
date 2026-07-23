import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { defineQuery } from 'next-sanity'

export const FRONT_FEED_QUERY = defineQuery(`
  *[
    _type == "teaserLarge" &&
    target[0]->_type == "article" &&
    defined(target[0]->publishDate) &&
    !(_id in *[_type == "front"] | order(publishDate desc)[0].pageBuilder[]._ref)
  ] | order(target[0]->publishDate desc) [$start...$end] {
    ${TEASER_LARGE_FRAGMENT}
  }
`)
