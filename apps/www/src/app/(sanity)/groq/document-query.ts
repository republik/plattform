import { BYLINE_FRAGMENT } from '@/app/(sanity)/groq/byline-fragment'
import { CTA_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/cta-block-fragment'
import { MENU_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/menu-block-fragment'
import { PORTABLE_TEXT_CONTENT_FRAGMENT } from '@/app/(sanity)/groq/portable-text-content-fragment'
import {
  TEASER_LARGE_FRAGMENT,
  type TeaserLargeFragmentType,
} from '@/app/(sanity)/groq/teaser-large-fragment'
import { TEASER_LIST_BLOCK_FRAGMENT } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASER_SMALL_FRAGMENT } from '@/app/(sanity)/groq/teaser-small-fragment'
import type { DOCUMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export type ArticleDocumentType = Extract<
  DOCUMENT_QUERY_RESULT,
  { _type: 'article' }
>

export type PageDocumentType = Extract<DOCUMENT_QUERY_RESULT, { _type: 'page' }>

export type PageBuilderBlock =
  | NonNullable<NonNullable<PageDocumentType>['pageBuilder']>[number]
  // Manually add teaserLarge type because Sanity codegen can't infer reference types
  | {
      _key: string
      _type: 'teaserLarge'
      reference: TeaserLargeFragmentType
    }

export const DOCUMENT_QUERY = defineQuery(
  `*[_type in ["article", "page"] && slug.current == $slug][0]{
    _id,
    _type,
    title,
    description,
    "slug": slug.current,
    _updatedAt,
    cover {
      ...
    },
    heading->{
      _id,
      title,
      "slug": slug.current
    },
    theme {
      name,
      accentColor,
      darkMode
    },

    _type == "article" => {
      repoId,
      "plainTitle": pt::text(title),
      audioSourceMp3,
      audioDurationMs,
      _updatedAt,
      publishDate,
      // Plain text and SEO overrides, used for the JSON-LD linked data
      "plainTitle": pt::text(title),
      "plainDescription": pt::text(description),
      seo {
        title,
        description,
        image,
        useImageBuilder
      },
      readingAccess,
      discussion->{
        backendDiscussionId
      },
      inlineDiscussion,
      ${BYLINE_FRAGMENT},
      newsletter->{
        title,
        description,
        frequency,
        image,
        name,
      },
      ${PORTABLE_TEXT_CONTENT_FRAGMENT},
      contributors[]{
        _id,
        kind,
        // Same profile slug as the byline links
        "slug": coalesce(contributor->slug.current, contributor->userId),
        "name": contributor->title,
        "description": contributor->description,
        "portrait": contributor->portrait
      },
      "articleCollection": articleCollections[featured == true][0].collection->{
        _id,
        title,
        description,
        image,
        series
      },
      articleRecommendations[]->{
        ${TEASER_SMALL_FRAGMENT}
      }
    },

    _type == "page" => {
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
        _type == "teaserLarge" => {
          "reference": @->{${TEASER_LARGE_FRAGMENT}}
        },
      }
    }
  }`,
)
