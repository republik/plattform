import { TEASER_LIST_BLOCK_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const TEASER_LIST_BLOCK_FRAGMENT = /* groq */ `
  appearance,
  color,
  backgroundColor,
  imageStyle,
  skipDescription,
  maxItems,
  title,
  "total": select(
    source.sourceType == "MANUAL" => count(source.items),
    source.sourceType == "COLLECTION" => count(*[
      (
        _type == "article" &&
        ^.source.collection._ref in articleCollections[].collection._ref
      ) || (
        _type == "teaser" &&
        collection._ref == ^.source.collection._ref
      )
    ]),
    0
  ),
  "series": source.sourceType == "COLLECTION" &&
    source.collection->series == true,
  "collectionId": source.collection._ref
`

// Hack to not rely on the main query for types
const TEASER_LIST_BLOCK_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "teaserList"][0]{
      ${TEASER_LIST_BLOCK_FRAGMENT}
    }
  }`,
)

export type TeaserListBlockFragmentType = NonNullable<
  NonNullable<TEASER_LIST_BLOCK_FRAGMENT_QUERY_RESULT>['block']
>
