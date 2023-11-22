import { EVENT_QUERY, EventRecordFields } from '@app/graphql/cms/events.query'
import { useFragment } from '@app/graphql/gql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { notFound } from 'next/navigation'
import * as ics from 'ics'

const getDateArray = (date: Date): [number, number, number, number, number] => [
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
]

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } },
) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENT_QUERY,
    variables: { slug },
  })
  const event = useFragment(EventRecordFields, data.event)

  if (!event) {
    return notFound()
  }

  const start = new Date(Date.parse(event.startAt))
  const end = event.endAt ? new Date(Date.parse(event.endAt)) : undefined

  const { error, value } = ics.createEvent({
    start: getDateArray(start),
    end: end ? getDateArray(end) : undefined,
    duration: end ? undefined : { hours: 1 },
    location: event.location,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/veranstaltungen/${event.slug}`,
    title: event.title,
  })

  if (error) {
    throw Error(error.message)
  }

  return new Response(value, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.title}.ics"`,
    },
  })
}
