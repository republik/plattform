import { EVENTS_QUERY } from '@app/graphql/cms/events.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { EventTeaser } from './components/event-teaser'

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENTS_QUERY,
  })
  const me = await getMe()

  return (
    <div>
      <h1>Kommende Veranstaltungen</h1>
      {data.events.map((ev) => {
        return (
          <EventTeaser
            key={ev.id}
            event={ev}
            isMember={
              me?.roles &&
              Array.isArray(me.roles) &&
              me.roles.includes('member')
            }
          />
        )
      })}
    </div>
  )
}
