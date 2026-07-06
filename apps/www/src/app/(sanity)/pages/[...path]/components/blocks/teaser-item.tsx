import { FrontTeaser } from '@/app/(sanity)/components/portable-text/front-teaser'
import { sanityFetch } from '@/app/(sanity)/lib/live'
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
  blockKey,
  documentId,
}: {
  blockKey: string
  documentId: string
}) {
  const { data } = await sanityFetch({
    query: TEASER_BLOCK_QUERY,
    params: { documentId, blockKey },
  })

  console.log(data)

  if (!data || !data.block) return null

  return (
    <FrontTeaser
      href={`/articles${data.block.reference.slug}`}
      value={data.block.reference.frontTeaser}
    />
  )
}
