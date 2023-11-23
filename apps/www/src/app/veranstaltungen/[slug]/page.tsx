import {
  EVENT_META_QUERY,
  EVENT_QUERY,
  EventRecordFields,
} from '@app/graphql/cms/events.query'
import { useFragment } from '@app/graphql/gql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventTeaser } from '../components/event-teaser'
import { Metadata, ResolvingMetadata } from 'next'

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata(
  { params: { slug } }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data } = await getCMSClient().query({
    query: EVENT_META_QUERY,
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
    return parentMetadata
  }

  const previousImages = parentMetadata.openGraph.images || []

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

export default async function Page({ params: { slug } }: PageProps) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: EVENT_QUERY,
    variables: { slug },
    context: {
      fetchOptions: {
        next: {
          tags: ['event'],
        },
      },
    },
  })
  const event = useFragment(EventRecordFields, data.event)
  const me = await getMe()

  if (!event) {
    return notFound()
  }

  return (
    <div>
      <EventTeaser
        key={event.id}
        event={event}
        isPage
        isMember={
          me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
        }
      />
      <p className={css({ mt: '6' })}>
        <Link href='/veranstaltungen'>Alle Veranstaltungen</Link>
      </p>
    </div>
  )
}
