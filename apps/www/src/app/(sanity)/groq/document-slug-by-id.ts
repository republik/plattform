import { defineQuery } from 'next-sanity'

export const DOCUMENT_SLUG_BY_ID = defineQuery(`
  *[
    _type in ["article", "page"] &&
    _id == $id
  ][0] {
    "slug": slug.current
  }.slug`)
