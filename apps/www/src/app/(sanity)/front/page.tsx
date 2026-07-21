import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Block } from '@/app/(sanity)/front/components/block'
import { RestOfTheFront } from '@/app/(sanity)/front/components/rest-of-the-front'
import { FRONT_QUERY } from '@/app/(sanity)/groq/front-query'
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

      {pageBuilder.map((block) => (
        <Block key={block._key} block={block} documentId={_id} />
      ))}

      {restOfFrontStart && <RestOfTheFront before={restOfFrontStart} />}
    </EventTrackingContext>
  )
}
