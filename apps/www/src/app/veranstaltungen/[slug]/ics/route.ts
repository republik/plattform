import { getFragmentData } from '#graphql/cms/__generated__/gql'
import {
  EventDocument,
  EventRecordFieldsFragmentDoc,
} from '#graphql/cms/__generated__/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import dayjs from 'dayjs'
import ical, { ICalCalendarMethod } from 'ical-generator'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { notFound } from 'next/navigation'
import { v5 as uuidV5 } from 'uuid'

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } },
) {
  const client = await getCMSClient()
  const { data } = await client.query({
    query: EventDocument,
    variables: { slug },
  })
  const event = getFragmentData(EventRecordFieldsFragmentDoc, data.event)

  if (!event) {
    return notFound()
  }

  const url = `${PUBLIC_BASE_URL}/veranstaltungen/${event.slug}`

  // Deterministic UUID
  const id = uuidV5(url, uuidV5.URL)

  const start = dayjs(event.startAt)
  const end = event.endAt ? dayjs(event.endAt) : start.add(1, 'hour')

  // We assume that multi-day events are all-day.
  const allDay = !start.isSame(end, 'day')

  const calendar = ical({ method: ICalCalendarMethod.PUBLISH })

  calendar.createEvent({
    id,
    start: start.toDate(),
    end: end.toDate(),
    allDay,
    location: event.location,
    url,
    summary: event.title,
  })

  return new Response(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  })
}
