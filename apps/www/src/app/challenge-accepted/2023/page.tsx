import type { Metadata, ResolvingMetadata } from 'next'

import {
  ChallengeAcceptedHubDocument,
  ChallengeAcceptedHubMetaDocument,
} from '#graphql/cms/__generated__/gql/graphql'
import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { EmailSignUp } from '@app/app/challenge-accepted/components/ca-newsletter-sign-up/email-signup'
import { PersonBubble } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'
import Container from '@app/components/container'
import { Share } from '@app/components/share/share'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { getNewsletterSubscriptionStatus } from '@app/lib/newsletters'
import { IconShare } from '@republik/icons'
import { css } from '@republik/theme/css'
import { hstack, vstack } from '@republik/theme/patterns'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Image from 'next/image'
import { StructuredText } from 'react-datocms/structured-text'

export async function generateMetadata(
  _, // params
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = await getCMSClient()
  const { data } = await client.query({
    query: ChallengeAcceptedHubMetaDocument,
  })

  const parentMetadata = await parent
  const parentMetaImages = parentMetadata?.openGraph?.images || []

  const { title, description, image } = data.hub?.metadata || {}

  return {
    title: title || 'Challenge Accepted',
    description: description,
    openGraph: {
      title: title || 'Challenge Accepted',
      description: description,
      images: [image?.url, ...parentMetaImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || 'Challenge Accepted',
      description: description,
      images: [image?.url, ...parentMetaImages],
    },
  }
}

export default async function Page() {
  const client = await getCMSClient()
  const {
    data: { hub },
  } = await client.query({
    query: ChallengeAcceptedHubDocument,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  const [{ me }, isNewsletterSubscribed] = await Promise.all([
    getMe(),
    getNewsletterSubscriptionStatus({
      newsletterName: NewsletterName.Climate,
    }),
  ])

  const share = (
    <Share
      title='Challenge Accepted'
      url={`${PUBLIC_BASE_URL}/challenge-accepted/2023`}
      emailSubject='Republik: Challenge Accepted'
    >
      <div
        className={hstack({
          gap: '2',
          color: 'text',
          textStyle: 'sansSerifBold',
          fontSize: 'm',
          cursor: 'pointer',
          _hover: {
            color: 'contrast',
          },
        })}
      >
        <IconShare size={20} /> Teilen
      </div>
    </Share>
  )

  return (
    <EventTrackingContext category='ChallengeAcceptedLandingPage2023'>
      <h1
        className={css({
          mt: '8',
          mb: '8',
          position: 'absolute',
          width: 'full',
          height: 'min(63vw, 1000px)',
          left: 0,
          _dark: {
            filter: 'invert(1)',
          },
        })}
      >
        <Image
          src={hub.logo?.url}
          priority
          fill
          className={css({ objectFit: 'contain' })}
          alt='Challenge Accepted Logo'
        />
      </h1>
      <section
        className={css({
          pt: 'min(40vw, 500px)',
          // mx: '-4',
          overflow: 'hidden',
        })}
      >
        <PersonBubble />
      </section>
      <Container>
        <div className={vstack({ gap: '16-32', alignItems: 'stretch' })}>
          <div className={css({ margin: '0 auto' })}>{share}</div>

          <section className={css({ textStyle: 'pageIntro' })}>
            <StructuredText data={hub.introduction.value} />
          </section>

          <section>
            <h2
              className={css({
                textStyle: 'h1Sans',
                fontWeight: 'bold',
                mb: '6',
              })}
            >
              Mehr erfahren zu …
            </h2>
            <PersonList />
          </section>

          {!isNewsletterSubscribed && (
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '8',
                fontSize: '2xl',
              })}
            >
              <h2 className={css({ fontWeight: 'bold' })}>
                {hub.newsletterSignupTagline}
              </h2>
              <EmailSignUp me={me} newsletterName={NewsletterName.Climate} />
            </div>
          )}

          <section
            className={css({
              color: 'text',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',

              textStyle: 'paragraph',

              '& ul > li': {
                listStyleType: 'none',
                pl: '6',
                position: 'relative',
                '&::before': {
                  content: '"–"',
                  position: 'absolute',
                  left: '0',
                },
              },
              '& ol': { listStyleType: 'decimal', pl: '6' },
              '& h2, & h3, & h4, & h5, & h6': {
                fontWeight: 'bold',
              },
              '& p a': {
                color: 'link',
                textDecoration: 'underline',
              },
            })}
          >
            <StructuredText data={hub.outro.value} />
          </section>
          <div className={css({ margin: '0 auto' })}>{share}</div>
        </div>
      </Container>
    </EventTrackingContext>
  )
}
