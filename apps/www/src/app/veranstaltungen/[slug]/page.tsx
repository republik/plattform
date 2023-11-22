import { EVENT_QUERY, EventRecordFields } from '@app/graphql/cms/events.query'
import { useFragment } from '@app/graphql/gql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventTeaser } from '../components/event-teaser'

export default async function Page({ params: { slug } }) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENT_QUERY,
    variables: { slug },
  })
  const event = useFragment(EventRecordFields, data.event)
  const me = await getMe()

  if (!event) {
    return notFound()
  }

  return (
    <div>
      <EventTeaser
        key={event.id}
        event={event}
        isPage
        isMember={
          me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
        }
      />
      <p className={css({ mt: '6' })}>
        <Link href='/veranstaltungen'>Alle Veranstaltungen</Link>
      </p>
    </div>
  )
}
