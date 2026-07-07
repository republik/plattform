import { FrontTeaser } from '@/app/(sanity)/components/portable-text/front-teaser'
import { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'
import { defineQuery } from 'next-sanity'

const TEASER_BLOCK_QUERY = defineQuery(
  `*[_type == "page" && _id == $documentId][0]{
    _id,
    "block": pageBuilder[_key == $blockKey && _type == "teaserItem"][0]{
      reference -> {
        "slug": slug.current,
        frontTeaser {
          layout,
          title,
          lead,
          image,
          imageCredits,
          imagePosition,
          imagePadding,
          textPosition,
          textSize,
          color,
          backgroundColor
        }
      }
    }
  }`,
)

export async function TeaserItem({
  teaser,
}: {
  teaser: TeaserBlockFragmentType
}) {
  return (
    <FrontTeaser
      href={`/articles${teaser.reference.slug}`}
      value={teaser.reference.frontTeaser}
    />
  )
}
