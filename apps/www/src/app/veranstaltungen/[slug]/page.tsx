import { EventTeaser } from '../components/event-teaser'
import { EVENT_QUERY } from '@app/graphql/cms/events.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params: { slug } }) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENT_QUERY,
    variables: { slug },
  })
  const me = await getMe()

  if (!data.event) {
    return notFound()
  }

  return (
    <div>
      <h2>Veranstaltung</h2>
      <EventTeaser
        key={data.event.id}
        event={data.event}
        isPage
        isMember={
          me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
        }
      />
      <p>
        <Link href='/veranstaltungen'>Alle Veranstaltungen</Link>
      </p>
    </div>
  )
}
