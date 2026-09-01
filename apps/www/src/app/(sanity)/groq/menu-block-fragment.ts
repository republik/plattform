import { MENU_BLOCK_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const MENU_BLOCK_FRAGMENT = /* groq */ `
  hasSeparator,
  heading {
    title,
    page->{
      _id,
      "title": pt::text(title),
      "slug": slug.current
    }
  },
  pages[]{
    _key,
    _type,
    _type == "link" => {
      href,
      title
    },
    _type == "reference" => {
      "page": @->{
        _id,
        "title": pt::text(title),
        "slug": slug.current
      }
    }
  }
`

// Hack to not rely on the main query for types
const MENU_BLOCK_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "menu"][0]{
      ${MENU_BLOCK_FRAGMENT}
    }
  }`,
)

export type MenuBlockFragmentType = NonNullable<
  NonNullable<MENU_BLOCK_FRAGMENT_QUERY_RESULT>['block']
>
