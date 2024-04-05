import type { Metadata, ResolvingMetadata } from 'next'

import { PersonBubble } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'
import { CANewsletterSignUp } from '@app/app/challenge-accepted/components/ca-newsletter-sign-up'
import { CollectionFilter } from '@app/app/challenge-accepted/components/collection-filter'
import CollectionRenderer from '@app/app/challenge-accepted/components/collection-render'
import Container from '@app/components/container'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import { hstack, vstack } from '@republik/theme/patterns'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'
import { Share } from '@app/components/share/share'
import { IconShare } from '@republik/icons'
import {
  ChallengeAcceptedHubDocument,
  ChallengeAcceptedHubMetaDocument,
} from '#graphql/cms/__generated__/gql/graphql'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { PUBLIC_BASE_URL } from 'lib/constants'

export async function generateMetadata(
  _, // params
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = getCMSClient()
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
  const {
    data: { hub },
  } = await getCMSClient().query({
    query: ChallengeAcceptedHubDocument,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  const me = await getMe()

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
    <EventTrackingContext category='ChallengeAcceptedLandingPage'>
      <Container>
        <CANewsletterSignUp
          me={me}
          id='newsletter-top'
          description={hub.newsletterSignupIntro}
          title={hub.newsletterSignupTagline}
        >
          {<StructuredText data={hub.newsletterSignupBenefits?.value} />}
        </CANewsletterSignUp>
      </Container>
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

          <section>
            <div
              className={css({ mb: '6', overflowY: 'auto', maxWidth: 'full' })}
            >
              <CollectionFilter filter={searchParams.filter} />
            </div>
            <CollectionRenderer
              items={hub.items}
              filter={searchParams.filter}
              isMember={
                me?.roles &&
                Array.isArray(me.roles) &&
                me.roles.includes('member')
              }
            />
          </section>
          <CANewsletterSignUp
            me={me}
            description={hub.newsletterSignupIntro}
            title={hub.newsletterSignupTagline}
          />

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
