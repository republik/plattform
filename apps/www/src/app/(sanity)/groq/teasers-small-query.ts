import { TEASER_SMALL_DOCUMENT_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-document-fragment'
import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import { defineQuery } from 'next-sanity'

export const TEASERS_SMALL_QUERY_DESC = defineQuery(`
  *[_id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[$start...$end]->{
          _type in ["article", "page"] => {
            ${TEASER_SMALL_FRAGMENT}
          },
          _type == "teaserSmall" => {
            ${TEASER_SMALL_DOCUMENT_FRAGMENT}
          }
        },
        source.sourceType == "COLLECTION" => *[
          (
            _type == "article" &&
            ^.source.collection._ref in articleCollections[].collection._ref
          ) || (
            _type == "teaserSmall" &&
            collection._ref == ^.source.collection._ref
          )
        ] | order(publishDate desc) [$start...$end] {
          _type == "article" => {
            ${TEASER_SMALL_FRAGMENT}
          },
          _type == "teaserSmall" => {
            ${TEASER_SMALL_DOCUMENT_FRAGMENT}
          }
        }, []
      ),
    }
  }
`)

export const TEASERS_SMALL_QUERY_ASC = defineQuery(`
   *[_id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
     "teasers": select(
        source.sourceType == "MANUAL" => source.items[$start...$end]->{
          _type in ["article", "page"] => {
            ${TEASER_SMALL_FRAGMENT}
          },
          _type == "teaser" => {
            ${TEASER_SMALL_DOCUMENT_FRAGMENT}
          }
        },
        source.sourceType == "COLLECTION" => *[
          (
            _type == "article" &&
            ^.source.collection._ref in articleCollections[].collection._ref
          ) || (
            _type == "teaserSmall" &&
            collection._ref == ^.source.collection._ref
          )
        ] | order(publishDate asc) [$start...$end] {
          _type == "article" => {
            ${TEASER_SMALL_FRAGMENT}
          },
          _type == "teaserSmall" => {
            ${TEASER_SMALL_DOCUMENT_FRAGMENT}
          }
        }, []
      ),
    }
  }
`)
