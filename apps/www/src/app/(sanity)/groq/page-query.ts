import { CTA_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/cta-block-fragment'
import {
  FRONT_TEASER_FRAGMENT,
  type FrontTeaserFragmentType,
} from '@/app/(sanity)/groq/front-teaser-fragment'
import { MENU_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/menu-block-fragment'
import { PORTABLE_TEXT_CONTENT_FRAGMENT } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { TEASER_LIST_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import type { PAGE_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const PAGE_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    description,
    cover {
      ...
    },
    skipTitleBlock,
    useCoverAsTitle,
    heading->{
      _id,
      title,
      "slug": slug.current
    },
    theme {
      name,
      accentColor,
      backgroundColor,
      darkMode
    },
    pageBuilder[]{
      _key,
      _type,
      _type == "menu" => {
        ${MENU_BLOCK_FRAGMENT}
      },
      _type == "callToAction" => {
        ${CTA_BLOCK_FRAGMENT}
      },
      _type == "editorBlock" => {
        ${PORTABLE_TEXT_CONTENT_FRAGMENT}
      },
      _type == "teaserList" => {
        ${TEASER_LIST_BLOCK_FRAGMENT}
      },
      _type == "frontTeaser" => {
        "reference": @->{${FRONT_TEASER_FRAGMENT}}
      },
    }
  }`,
)

export type PageBuilderBlock =
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>['pageBuilder']>[number]
  // Manually add frontTeaser type because Sanity codegen can't infer reference types
  | {
      _key: string
      _type: 'frontTeaser'
      reference: FrontTeaserFragmentType
    }
