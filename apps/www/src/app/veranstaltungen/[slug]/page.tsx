import { EventTeaser } from '@app/app/challenge-accepted/components/teasers/event-teaser'
import { EVENT_QUERY } from '@app/graphql/cms/events.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
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
      <EventTeaser
        key={data.event.id}
        event={data.event}
        isMember={
          me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
        }
      />
    </div>
  )
}
