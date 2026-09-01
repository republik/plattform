import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FrontBlock } from '@/app/(sanity)/front/components/front-block'
import { FRONT_QUERY } from '@/app/(sanity)/groq/front-query'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { FrontPreviewBar } from '@/app/(sanity)/preview/front/[id]/front-preview-bar'
import { css } from '@republik/theme/css'
import { stegaClean, toPlainText } from 'next-sanity'
import { notFound } from 'next/navigation'

export default async function FrontPreviewPage({
  params,
}: PageProps<'/preview/front/[id]'>) {
  const { id } = await params
  const { data: front } = await sanityFetch({
    query: FRONT_QUERY,
    params: { id },
  })

  if (!front) notFound()

  const { _id, pageBuilder = [] } = front

  return (
    <div className={css({ position: 'relative' })}>
      <FrontPreviewBar
        sanityDataAttr={dataAttribute({
          id: _id,
          type: 'front',
          path: 'pageBuilder',
        })}
      >
        <span>{stegaClean(toPlainText(front.title))}</span>
        <span
          className={css({
            textDecoration: 'underline',
            fontWeight: 'normal',
          })}
        >
          Bearbeiten
        </span>
      </FrontPreviewBar>

      {pageBuilder.map((block) => (
        <div key={block._key}>
          <FrontBlock block={block} documentId={_id} />
        </div>
      ))}
    </div>
  )
}
