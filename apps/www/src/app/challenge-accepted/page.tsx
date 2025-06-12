import type { Metadata, ResolvingMetadata } from 'next'

import {
  ChallengeAcceptedHubDocument,
  ChallengeAcceptedHubMetaDocument,
} from '#graphql/cms/__generated__/gql/graphql'
import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { EmailSignUp } from '@app/app/challenge-accepted/components/ca-newsletter-sign-up/email-signup'
import { CollectionFilter } from '@app/app/challenge-accepted/components/collection-filter'
import CollectionRenderer from '@app/app/challenge-accepted/components/collection-render'
import Container from '@app/components/container'
import { Share } from '@app/components/share/share'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { getNewsletterSubscriptionStatus } from '@app/lib/newsletters'
import { IconShare } from '@republik/icons'
import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'

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

export default async function Page({ searchParams }) {
  const client = await getCMSClient()
  const {
    data: { hub, challengeAcceptedTag, allNewsletters },
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

  const allEvents = challengeAcceptedTag?.events ?? []

  const [{ me }, isNewsletterSubscribed] = await Promise.all([
    getMe(),
    getNewsletterSubscriptionStatus({
      newsletterName: NewsletterName.Climate,
    }),
  ])

  const share = (
    <Share
      title='Challenge Accepted'
      url={`${PUBLIC_BASE_URL}/challenge-accepted`}
      emailSubject='Republik: Challenge Accepted'
    >
      <div
        className={hstack({
          gap: '2',
          color: 'text',
          textStyle: 'sansSerifBold',
          fontSize: 'base',
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
    <EventTrackingContext category='ChallengeAcceptedLandingPage'>
      <h1
        className={css({
          mt: '8',
          mb: '8',
          ml: '4',
          width: 'full',
          maxWidth: 'calc(100% - token(spacing.8))',
          position: 'relative',
          height: 'min(63vw, 640px)',
          // left: 0,
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

      <Container>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '8-16',
            fontSize: '2xl',
          })}
        >
          <p className={css({ textStyle: 'pageIntro' })}>
            {hub.newsletterSignupIntro}
          </p>

          {!isNewsletterSubscribed && (
            <>
              <p className={css({ fontWeight: 'bold', fontSize: '2xl' })}>
                {hub.newsletterSignupTagline}
              </p>
              <EmailSignUp me={me} newsletterName={NewsletterName.Climate} />
              <div
                className={css({
                  fontSize: '2xl',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                <StructuredText data={hub.newsletterSignupBenefits?.value} />
              </div>
            </>
          )}

          <div className={css({ margin: '0 auto' })}>{share}</div>

          <section className={css({ fontSize: 'base' })}>
            <div
              className={css({ mb: '6', overflowY: 'auto', maxWidth: 'full' })}
            >
              <CollectionFilter filter={searchParams.filter} />
            </div>
            <CollectionRenderer
              highlights={hub.items}
              events={allEvents}
              newsletters={allNewsletters}
              filter={searchParams.filter}
              isMember={
                me?.roles &&
                Array.isArray(me.roles) &&
                me.roles.includes('member')
              }
            />
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
