import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { EventTeaser } from './components/event-teaser'
import { css } from '@republik/theme/css'
import { getFragmentData } from '#graphql/cms/__generated__/gql'
import {
  EventRecordFieldsFragmentDoc,
  EventsDocument,
} from '#graphql/cms/__generated__/gql/graphql'

export default async function Page() {
  const client = await getCMSClient()
  const { data } = await client.query({
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
  const currentEvents = getFragmentData(
    EventRecordFieldsFragmentDoc,
    data.events,
  )
  const pastEvents = getFragmentData(
    EventRecordFieldsFragmentDoc,
    data.pastEvents,
  )

  const { isMember } = await getMe()

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
      {currentEvents.length === 0 ? (
        <p className={css({ py: '6', fontStyle: 'italic' })}>
          Aktuell sind keine Veranstaltungen geplant.
        </p>
      ) : (
        currentEvents.map((ev) => {
          return <EventTeaser key={ev.id} event={ev} isMember={isMember} />
        })
      )}
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
