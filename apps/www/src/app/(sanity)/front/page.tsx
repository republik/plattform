import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Block } from '@/app/(sanity)/front/components/block'
import { FrontFeed } from '@/app/(sanity)/front/components/front-feed'
import { FRONT_QUERY } from '@/app/(sanity)/groq/front-query'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import { notFound } from 'next/navigation'

export default async function FrontPage() {
  const { data: front } = await sanityFetch({ query: FRONT_QUERY })

  if (!front) notFound()

  const { _id, title, pageBuilder = [], oldestPublishDate } = front

  const restOfFrontStart = oldestPublishDate
    ? stegaClean(oldestPublishDate)
    : undefined

  return (
    <EventTrackingContext category='Front'>
      <h1 className={css({ srOnly: true })}>
        <InlinePortableText value={title} />
      </h1>

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

      {restOfFrontStart && <FrontFeed before={restOfFrontStart} />}
    </EventTrackingContext>
  )
}
