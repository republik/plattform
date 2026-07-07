import { FEED_TEASER_FRAGMENT } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { defineQuery } from 'next-sanity'

export const FEED_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      "teasers": select(
        source.sourceType == "MANUAL" => source.items[$start...$end]->{
          ${FEED_TEASER_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[]._ref
        ] | order(publishDate desc) [$start...$end] {
          ${FEED_TEASER_FRAGMENT}
        }, []
      ),
    }
  }
`)
