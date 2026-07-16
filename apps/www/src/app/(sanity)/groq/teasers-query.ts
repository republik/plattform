import { TEASER_FRAGMENT } from '@/app/(sanity)/groq/teaser-fragment'
import { defineQuery } from 'next-sanity'

export const TEASERS_QUERY_DESC = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[@->_type in ["article", "page"]][$start...$end]->{
          ${TEASER_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[].collection._ref
        ] | order(publishDate desc) [$start...$end] {
          ${TEASER_FRAGMENT}
        }, []
      ),
    }
  }
`)

export const TEASERS_QUERY_ASC = defineQuery(`
   *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[@->_type in ["article", "page"]][$start...$end]->{
          ${TEASER_FRAGMENT}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[].collection._ref
        ] | order(publishDate asc) [$start...$end] {
          ${TEASER_FRAGMENT}
        }, []
      ),
    }
  }
`)
