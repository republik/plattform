import { PagePortableText } from '@/app/(sanity)/components/portable-text/renderPage'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery } from 'next-sanity'

const PAGE_BUILDER_EDITOR_BLOCK_QUERY = defineQuery(
  `*[_type == "page" && _id == $documentId][0]{
    _id,
    "block": pageBuilder[_key == $blockKey][0]{
      content[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug
          }
        }
      }
    }
  }`,
)

export async function EditorBlock({
  blockKey,
  documentId,
}: {
  blockKey: string
  documentId: string
}) {
  const { data } = await sanityFetch({
    query: PAGE_BUILDER_EDITOR_BLOCK_QUERY,
    params: { documentId, blockKey },
  })

  if (!data || !data.block) return null

  return <PagePortableText value={data.block.content} />
}
