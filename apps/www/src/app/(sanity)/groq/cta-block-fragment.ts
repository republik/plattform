import { CTA_BLOCK_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

export const CTA_BLOCK_FRAGMENT = /* groq */ `
  target->{
    _id,
    _type,
    _type == "newsletter" => {
      name,
      title
    },
    _type == "podcast" => {
      podigeeSlug,
      spotifyUrl,
      appleUrl
    },
    _type == "articleCollection" => {
      title,
      description
    }
  }
`

// Hack to not rely on the main query for types
const CTA_BLOCK_FRAGMENT_QUERY = defineQuery(
  `*[_type == "page"][0]{
    "block": pageBuilder[_type == "callToAction"][0]{
      ${CTA_BLOCK_FRAGMENT}
    }
  }`,
)

export type CtaBlockFragmentType = NonNullable<
  NonNullable<CTA_BLOCK_FRAGMENT_QUERY_RESULT>['block']
>
