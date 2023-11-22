import { EVENT_QUERY, EventRecordFields } from '@app/graphql/cms/events.query'
import { useFragment } from '@app/graphql/gql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import dayjs from 'dayjs'
import ical, { ICalCalendarMethod } from 'ical-generator'
import { notFound } from 'next/navigation'
import { v5 as uuidV5 } from 'uuid'

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

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/veranstaltungen/${event.slug}`

  // Deterministic UUID
  const id = uuidV5(url, uuidV5.URL)

  const start = dayjs(event.startAt)
  const end = event.endAt ? dayjs(event.endAt) : start.add(1, 'hour')

  const calendar = ical({ method: ICalCalendarMethod.PUBLISH })

  calendar.createEvent({
    id,
    start: start.toDate(),
    end: end.toDate(),
    location: event.location,
    url,
    summary: event.title,
  })

  return new Response(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.title}.ics"`,
    },
  })
}
