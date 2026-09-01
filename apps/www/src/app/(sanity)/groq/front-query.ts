import { TEASER_LARGE_FRAGMENT } from '@/app/(sanity)/groq/teaser-large-fragment'
import { TEASER_LIST_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { defineQuery } from 'next-sanity'

export const FRONT_QUERY = defineQuery(
  `*[_type == "front" && _id == $id][0]{
    _id,
    title,
    pageBuilder[]{
      _key,
      _type,
      _type == "teaserList" => {
        ${TEASER_LIST_BLOCK_FRAGMENT}
      },
      _type == "teaserLarge" => {
        "reference": @->{${TEASER_LARGE_FRAGMENT}}
      },
    },
  }`,
)
