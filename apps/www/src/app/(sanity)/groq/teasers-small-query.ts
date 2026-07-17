import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const TEASERS_SMALL_QUERY_DESC = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[@->_type in ["article", "page"]][$start...$end]->{
          ${TEASER_SMALL_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[].collection._ref
        ] | order(publishDate desc) [$start...$end] {
          ${TEASER_SMALL_FRAGMENT}
        }, []
      ),
    }
  }
`)

export const TEASERS_SMALL_QUERY_ASC = defineQuery(`
   *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[@->_type in ["article", "page"]][$start...$end]->{
          ${TEASER_SMALL_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[].collection._ref
        ] | order(publishDate asc) [$start...$end] {
          ${TEASER_SMALL_FRAGMENT}
        }, []
      ),
    }
  }
`)
