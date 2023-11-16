import { EventTeaser } from '@app/app/challenge-accepted/components/teasers/event-teaser'
import { EVENTS_QUERY } from '@app/graphql/cms/events.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import Link from 'next/link'

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENTS_QUERY,
  })
  const me = await getMe()

  return (
    <div>
      {data.events.map((ev) => {
        return (
          <>
            <EventTeaser
              key={ev.id}
              event={ev}
              isMember={
                me?.roles &&
                Array.isArray(me.roles) &&
                me.roles.includes('member')
              }
            />
            <Link href={`/veranstaltungen/${ev.slug}`}>Go</Link>
          </>
        )
      })}
    </div>
  )
}
