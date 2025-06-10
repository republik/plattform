import { getFragmentData } from '#graphql/cms/__generated__/gql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventTeaser } from '../components/event-teaser'
import { Metadata, ResolvingMetadata } from 'next'
import {
  EventMetaDocument,
  EventDocument,
  EventRecordFieldsFragmentDoc,
} from '#graphql/cms/__generated__/gql/graphql'
import { PUBLIC_BASE_URL } from 'lib/constants'

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata(
  { params: { slug } }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data } = await getCMSClient().query({
    query: EventMetaDocument,
    variables: { slug },
    context: {
      fetchOptions: {
        next: {
          tags: ['event'],
        },
      },
    },
  })
  const parentMetadata = await parent

  if (!data.event) {
    // @ts-expect-error https://github.com/vercel/next.js/issues/59950
    return parentMetadata
  }

  const previousImages = parentMetadata.openGraph?.images || []

  const metadata: Metadata = {
    title: `${data.event.seo?.title ?? data.event.title}`,
    description: data.event.seo?.description,
  }

  // Create Event structured data for schema.org
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.event.title,
    description: `Veranstaltung: ${data.event.title} - ${data.event.location}`,
    startDate: data.event.startAt,
    endDate: data.event.endAt || data.event.startAt,
    location: data.event.location
      ? {
          '@type': 'Place',
          name: data.event.location,
          ...(data.event.locationLink && { url: data.event.locationLink }),
        }
      : undefined,
    url: `${PUBLIC_BASE_URL}/veranstaltungen/${slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'Republik',
      url: PUBLIC_BASE_URL,
    },
    ...(data.event.signUpLink && {
      offers: {
        '@type': 'Offer',
        url: data.event.signUpLink,
        ...(data.event.ticketPrice && {
          price: data.event.ticketPrice,
          priceCurrency: 'CHF',
        }),
        availability: data.event.fullyBooked
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        ...(data.event.membersOnly && { eligibleCustomerType: 'Members' }),
      },
    }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    // Add additional Event properties
    ...(data.event.membersOnly && {
      audience: {
        '@type': 'Audience',
        name: 'Republik Members',
      },
    }),
  }

  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      images: [data.event.seo?.image?.url, ...previousImages].filter(Boolean),
    },
    other: {
      'application/ld+json': JSON.stringify(eventStructuredData),
    },
  }
}

export default async function Page({ params: { slug } }: PageProps) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EventDocument,
    variables: { slug },
    context: {
      fetchOptions: {
        next: {
          tags: ['event'],
        },
      },
    },
  })
  const event = getFragmentData(EventRecordFieldsFragmentDoc, data.event)
  const { isMember } = await getMe()

  if (!event) {
    return notFound()
  }

  return (
    <div>
      <EventTeaser key={event.id} event={event} isPage isMember={isMember} />
      <p className={css({ mt: '6' })}>
        <Link
          className={css({
            color: 'primary',
            textDecoration: 'underline',
            _hover: { color: 'primaryHover' },
          })}
          href='/veranstaltungen'
        >
          Alle Veranstaltungen
        </Link>
      </p>
    </div>
  )
}
