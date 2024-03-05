import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { EventTeaser } from './components/event-teaser'
import { css } from '@app/styled-system/css'
import { useFragment } from '@graphql/cms/gql'
import {
  EventRecordFieldsFragmentDoc,
  EventsDocument,
} from '@graphql/cms/gql/graphql'

export default async function Page() {
  const { data } = await getCMSClient().query({
    query: EventsDocument,
    variables: {
      today: new Date(Date.now()).toISOString(),
    },
    context: {
      fetchOptions: {
        next: {
          tags: ['event'],
        },
      },
    },
  })
  const currentEvents = useFragment(EventRecordFieldsFragmentDoc, data.events)
  const pastEvents = useFragment(EventRecordFieldsFragmentDoc, data.pastEvents)

  const me = await getMe()
  const isMember =
    me?.roles && Array.isArray(me.roles) && me.roles.includes('member')

  return (
    <div>
      <h1
        className={css({
          textStyle: 'h2Sans',
          py: '6',
          borderColor: 'divider',
          borderBottomWidth: 1,
        })}
      >
        Veranstaltungen
      </h1>
      {currentEvents.map((ev) => {
        return <EventTeaser key={ev.id} event={ev} isMember={isMember} />
      })}
      {pastEvents.length > 0 && (
        <>
          <h2
            className={css({
              textStyle: 'h2Sans',
              pb: '6',
              pt: '12',
              borderColor: 'divider',
              borderBottomWidth: 1,
            })}
          >
            Vergangene Veranstaltungen
          </h2>
          {pastEvents.map((ev) => {
            return <EventTeaser key={ev.id} event={ev} isMember={isMember} />
          })}
        </>
      )}
    </div>
  )
}
