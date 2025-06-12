import Container from '@app/components/container'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PersonDetail } from './components/person-detail'

import { PersonDetailDocument } from '#graphql/cms/__generated__/gql/graphql'
import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { EmailSignUp } from '@app/app/challenge-accepted/components/ca-newsletter-sign-up/email-signup'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { getNewsletterSubscriptionStatus } from '@app/lib/newsletters'
import { vstack } from '@republik/theme/patterns'
import Image from 'next/image'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const client = await getCMSClient()
  const { data } = await client.query({
    query: PersonDetailDocument,
    variables: { slug },
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  if (!data.person) {
    notFound()
  }

  const { hub } = data

  const [{ me, isMember }, isNewsletterSubscribed] = await Promise.all([
    getMe(),
    getNewsletterSubscriptionStatus({
      newsletterName: NewsletterName.Climate,
    }),
  ])

  const personData: (typeof data)['person'] = {
    ...data.person,
    items: data.person.items.map((item) => {
      if (item.__typename !== 'EventRecord') {
        return item
      }
      return {
        ...item,
        signUpLink: item.membersOnly && isMember ? item.signUpLink : undefined,
      }
    }),
  }

  return (
    <EventTrackingContext category='ChallengeAcceptedPersonPage' name={slug}>
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          mx: '4',
          mt: { base: '4', md: '8' },
        })}
      >
        <Link
          href='/challenge-accepted/2023'
          className={css({
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            textDecoration: 'none',
            gap: '0.5',
            color: 'contrast',
            fontSize: 'sm',
            justifyContent: 'center',
            _dark: {
              filter: 'invert(1)',
            },
            width: { base: 80, md: 156 },
          })}
          title='Zur Übersicht'
        >
          <Image
            src={hub.logo?.url}
            priority
            width={156}
            height={100}
            className={css({ objectFit: 'contain' })}
            alt='Challenge Accepted Logo'
          />
        </Link>
      </div>
      <PersonDetail person={personData} isMember={isMember} />
      <Container>
        <div
          className={vstack({
            pt: '16-32',
            gap: '16-32',
            alignItems: 'stretch',
          })}
        >
          {!isNewsletterSubscribed && (
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '8',
                fontSize: '2xl',
              })}
            >
              <p>{hub.newsletterSignupIntro}</p>
              <h2 className={css({ fontWeight: 'bold' })}>
                {hub.newsletterSignupTagline}
              </h2>
              <EmailSignUp me={me} newsletterName={NewsletterName.Climate} />
            </div>
          )}

          <section>
            <h2
              className={css({
                textStyle: 'h1Sans',
                fontWeight: 'bold',
                mb: '6',
              })}
            >
              Direkt weiter zu …
            </h2>
            <PersonList linkToOverview hidePersonId={personData.id} />
          </section>
        </div>
      </Container>
    </EventTrackingContext>
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
            seo {
              title
              description
              image {
                url
              }
            }
          }
        }
      `,
      variables: { slug: params.slug },
    }),
  }).then((res) => res.json())

  const parentMetadata = await parent

  if (!res.data.person) {
    // @ts-expect-error https://github.com/vercel/next.js/issues/59950
    return parentMetadata
  }

  const metadata: Metadata = {
    title: `Challenge Accepted: ${res.data.person.name} | Republik`,
    description: `Die Klimakrise ist hier. Die Lage ist ernst. 25 Menschen, die die Herausforderung annehmen. Kurzporträt und Inhalte zu ${res.data.person.name}.`,
  }

  const previousImages = parentMetadata?.openGraph?.images || []

  const images = [
    res.data.person?.seo?.image?.url,
    `/challenge-accepted/person/${params.slug}/api/og`,
    ...previousImages,
  ].filter(Boolean)

  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      images,
    },
    twitter: {
      title: metadata.title,
      description: metadata.description,
      images,
    },
  }
}
