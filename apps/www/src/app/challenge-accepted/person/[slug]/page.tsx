import Container from '@app/components/container'
import { PersonDetail } from './components/person-detail'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { PERSON_DETAIL_QUERY } from '@app/graphql/cms/person-detail.query'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMe } from '@app/lib/auth/me'
import { Metadata, ResolvingMetadata } from 'next'
import { CANewsletterSignUp } from '@app/components/ca-newsletter-sign-up'
import { getClimateLabNewsletterSubscriptionStatus } from '@app/graphql/republik-api/newsletter.query'

type PageProps = {
  params: {
    slug: string
  }
}

export default async function Page({ params: { slug } }: PageProps) {
  const { data } = await getCMSClient().query({
    query: PERSON_DETAIL_QUERY,
    variables: { slug },
  })

  if (!data.person) {
    notFound()
  }

  const me = await getMe()
  const isMember =
    me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
  const isSubscribedToCANewsletter =
    await getClimateLabNewsletterSubscriptionStatus()

  const personData: typeof data['person'] = {
    ...data.person,
    items: data.person.items.map((item) => {
      if (item.__typename !== 'EventRecord') {
        return item
      }
      return {
        ...item,
        signUpLink: isMember || item.isPublic ? item.signUpLink : undefined,
      }
    }),
  }

  return (
    <>
      <Link href='/challenge-accepted'>Challenge Accepted Übersicht</Link>
      <Container>
        <PersonDetail person={personData} isMember={isMember} />
        {!isSubscribedToCANewsletter && (
          <CANewsletterSignUp defaultEmail={me ? me.email : undefined} />
        )}
        <p>TODO: Navigation zur Übersicht + andere Personen</p>
      </Container>
    </>
  )
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params

  const res = await fetch(process.env.DATO_CMS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `${process.env.DATO_CMS_API_TOKEN}`,
      // forbid invalid content to allow strict type checking
      'X-Exclude-Invalid': 'true',
    },
    body: JSON.stringify({
      query: `
        query PersonImage($slug: String!) {
          person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {
            name
          }
        }
      `,
      variables: { slug: params.slug },
    }),
  }).then((res) => res.json())

  const parentMetadata = await parent

  if (!res.data.person) {
    return parentMetadata
  }

  const previousImages = parentMetadata.openGraph?.images || []

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
    title: `${res.data.person.name} - Challenge Accepted | Republik`,
    openGraph: {
      images: [
        `/challenge-accepted/person/${params.slug}/api/og`,
        ...previousImages,
      ],
    },
    twitter: {
      images: [
        `/challenge-accepted/person/${params.slug}/api/og`,
        ...previousImages,
      ],
    },
  }
}
