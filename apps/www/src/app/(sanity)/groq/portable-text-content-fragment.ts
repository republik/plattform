import {
  type ARTICLE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT,
  type PAGE_PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT,
} from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const PORTABLE_TEXT_CONTENT_FRAGMENT = /* groq */ `
  content[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "slug": select(
          reference->_type == "contributor" => "/~" + coalesce(reference->slug.current, reference->userId),
          reference->slug.current
        )
      }
    },
    body[] { // Nested PT, e.g. in infoboxes
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "slug": select(
            reference->_type == "contributor" => "/~" + coalesce(reference->slug.current, reference->userId),
            reference->slug.current
          )
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
