import {
  type ARTICLE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT,
  type PAGE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT,
} from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// Resolves a document reference to the path it lives under.
// Contributors have no slug of their own, so they fall back to their userId.
const REFERENCE_SLUG = /* groq */ `select(
  reference->_type == "contributor" => "/~" + coalesce(reference->slug.current, reference->userId),
  reference->slug.current
)`

// A contributor's title is a plain string; articles and pages carry portable text.
const REFERENCE_TITLE = /* groq */ `select(
  reference->_type == "contributor" => reference->title,
  pt::text(reference->title)
)`

export const PORTABLE_TEXT_CONTENT_FRAGMENT = /* groq */ `
  content[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "slug": ${REFERENCE_SLUG}
      },
      _type == "expandableLink" => {
        "slug": ${REFERENCE_SLUG},
        "referenceTitle": ${REFERENCE_TITLE}
      }
    },
    body[] { // Nested PT, e.g. in infoboxes
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "slug": ${REFERENCE_SLUG}
        },
        _type == "expandableLink" => {
          "slug": ${REFERENCE_SLUG},
          "referenceTitle": ${REFERENCE_TITLE}
        }
      }
    },

    _type == "toc" => {
      ...,
      "headings": ^.content[_type == "block" && style == "heading"]
    },
    _type == "authorBlock" => {
      ...,
      contributor->
    },
    _type == "audio" => {
      ...,
      "fileUrl": file.asset->url
    },
  }
`
// Hack to not rely on the main query for types
// Separated page and article fragment types because not all blocks are shared
const PAGE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "editorBlock"][0]{
      ${PORTABLE_TEXT_CONTENT_FRAGMENT}
    }
  }`,
)
const ARTICLE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY = defineQuery(
  `*[_type == "article"][0]{
      ${PORTABLE_TEXT_CONTENT_FRAGMENT}
  }`,
)

export type PagePortableTextContentFragmentType = NonNullable<
  NonNullable<PAGE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT>['block']
>

export type ArticlePortableTextContentFragmentType = NonNullable<
  NonNullable<ARTICLE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT>
>

export type ArticlePortableTextBlockType =
  ArticlePortableTextContentFragmentType['content'][number]
