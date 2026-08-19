import { FrontBlock } from '@/app/(sanity)/front/components/front-block'
import { FRONT_QUERY } from '@/app/(sanity)/groq/front-query'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { notFound } from 'next/navigation'

export default async function FrontPreviewPage({
  params,
}: PageProps<'/preview/fronts/[id]'>) {
  const { id } = await params
  const { data: front } = await sanityFetch({
    query: FRONT_QUERY,
    params: { id },
  })

  if (!front) notFound()

  const { _id, pageBuilder = [] } = front

  return (
    <>
      <div
        data-sanity={dataAttribute({
          id: _id,
          type: 'front',
          path: 'pageBuilder',
        })}
      >
        {pageBuilder.map((block) => (
          <div
            key={block._key}
            data-sanity={dataAttribute({
              id: _id,
              type: 'front',
              path: `pageBuilder[_key=="${block._key}"]`,
            })}
          >
            <FrontBlock block={block} documentId={_id} />
          </div>
        ))}
      </div>
    </>
  )
}
