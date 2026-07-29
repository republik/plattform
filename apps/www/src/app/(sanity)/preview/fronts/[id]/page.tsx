import { Block } from '@/app/(sanity)/front/components/block'
import { FrontFeed } from '@/app/(sanity)/front/components/front-feed'
import { FRONT_BY_ID_QUERY } from '@/app/(sanity)/groq/front-by-id-query'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { notFound } from 'next/navigation'

export default async function FrontPage({
  params,
}: PageProps<'/preview/fronts/[id]'>) {
  const { id } = await params
  const { data: front } = await sanityFetch({
    query: FRONT_BY_ID_QUERY,
    params: { id },
  })

  if (!front) notFound()

  const { _id, pageBuilder = [] } = front

  return (
    <EventTrackingContext category='Front'>
      <h1 className={css({ srOnly: true })}>Republik Magazin</h1>

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
            <Block block={block} documentId={_id} />
          </div>
        ))}
      </div>

      <FrontFeed />
    </EventTrackingContext>
  )
}
