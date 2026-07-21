import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Block } from '@/app/(sanity)/front/components/block'
import { FRONT_QUERY } from '@/app/(sanity)/groq/front-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { notFound } from 'next/navigation'

function RestOfTheFront({ from }: { from?: string } = {}) {
  return null
}

export default async function FrontPage() {
  const { data: front } = await sanityFetch({ query: FRONT_QUERY })

  if (!front) notFound()

  const { _id, title, pageBuilder } = front

  return (
    <EventTrackingContext category='Front'>
      <h1 className={css({ srOnly: true })}>
        <InlinePortableText value={title} />
      </h1>

      {(pageBuilder ?? []).map((block) => (
        <Block key={block._key} block={block} documentId={_id} />
      ))}

      <RestOfTheFront />
    </EventTrackingContext>
  )
}
