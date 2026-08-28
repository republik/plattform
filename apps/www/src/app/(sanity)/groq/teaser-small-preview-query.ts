import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

// Preview an article/page's small teaser (with all its derived renderings) by id.
export const TEASER_SMALL_PREVIEW_QUERY = defineQuery(
  `*[_type in ["article", "page"] && _id == $id][0]{
    ${TEASER_SMALL_FRAGMENT}
  }`,
)
