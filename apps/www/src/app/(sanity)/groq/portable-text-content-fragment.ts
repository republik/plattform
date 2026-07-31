import { PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
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

    body[] {
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
    }
  }
`
// Hack to not rely on the main query for types
const PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "editorBlock"][0]{
      ${PORTABLE_TEXT_CONTENT_FRAGMENT}
    }
  }`,
)

export type PortableTextContentFragmentType = NonNullable<
  NonNullable<PORTABLE_TEXT_CONTENT_FRAGMENT_QUERY_RESULT>['block']
>
