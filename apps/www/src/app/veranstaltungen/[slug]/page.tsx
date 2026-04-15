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
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const client = await getCMSClient()
  const { data } = await client.query({
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

  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      images: [data.event.seo?.image?.url, ...previousImages].filter(Boolean),
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const client = await getCMSClient()
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

  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: `Veranstaltung: ${event.title} - ${event.location}`,
    startDate: event.startAt,
    endDate: event.endAt || event.startAt,
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
          ...(event.locationLink && { url: event.locationLink }),
        }
      : undefined,
    url: `${PUBLIC_BASE_URL}/veranstaltungen/${slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'Republik',
      url: PUBLIC_BASE_URL,
    },
    ...(event.signUpLink && {
      offers: {
        '@type': 'Offer',
        url: event.signUpLink,
        ...(event.ticketPrice && {
          price: event.ticketPrice,
          priceCurrency: 'CHF',
        }),
        availability: event.fullyBooked
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        ...(event.membersOnly && { eligibleCustomerType: 'Members' }),
      },
    }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.membersOnly && {
      audience: {
        '@type': 'Audience',
        name: 'Republik Members',
      },
    }),
  }

  return (
    <div>
      <script type='application/ld+json'>
        {JSON.stringify(eventStructuredData)}
      </script>
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
