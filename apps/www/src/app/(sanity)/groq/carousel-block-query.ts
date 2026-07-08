import { CAROUSEL_TEASER_FRAGMENT } from '@/app/(sanity)/groq/carousel-teaser-fragment'
import { defineQuery } from 'next-sanity'

export const CAROUSEL_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      "teasers": select(
        source.sourceType == "MANUAL" => source.items[$start...$end]->{
          ${CAROUSEL_TEASER_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[]._ref
        ] | order(publishDate desc) [$start...$end] {
          ${CAROUSEL_TEASER_FRAGMENT}
        }, []
      ),
    }
  }
`)
