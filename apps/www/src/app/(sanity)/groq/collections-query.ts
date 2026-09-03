import type { COLLECTIONS_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const COLLECTIONS_QUERY = defineQuery(`
  *[_type == "articleCollection" && _id in $ids]{
    _id,
    title,
    image
  }
`)

export type ArticleCollectionType =
  NonNullable<COLLECTIONS_QUERY_RESULT>[number]
