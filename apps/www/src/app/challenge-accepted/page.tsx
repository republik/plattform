import type { Metadata, ResolvingMetadata } from 'next'

import { PersonBubble } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'
import { CANewsletterSignUp } from '@app/components/ca-newsletter-sign-up'
import { CollectionFilter } from '@app/components/collection-filter'
import CollectionRenderer from '@app/components/collection-render'
import Container from '@app/components/container'
import {
  CHALLENGE_ACCEPTED_HUB_META_QUERY,
  CHALLENGE_ACCEPTED_HUB_QUERY,
} from '@app/graphql/cms/hub.query'
import { getClimateLabNewsletterSubscriptionStatus } from '@app/graphql/republik-api/newsletter.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'

export async function generateMetadata(
  _, // params
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = getCMSClient()
  const { data } = await client.query({
    query: CHALLENGE_ACCEPTED_HUB_META_QUERY,
  })

  const parentMetadata = await parent
  const parentMetaImages = parentMetadata?.openGraph?.images || []

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
    title: data.hub?.metadata?.title || 'Challenge Accepted',
    description: data.hub?.metadata?.description,
    openGraph: {
      images: [data.hub?.metadata?.image?.url, ...parentMetaImages],
    },
  }
}

export default async function Page({ searchParams }) {
  const cmsClient = getCMSClient()
  const { data } = await cmsClient.query({
    query: CHALLENGE_ACCEPTED_HUB_QUERY,
    context: {},
  })

  const me = await getMe()
  const isSubscribedToCANewsletter =
    await getClimateLabNewsletterSubscriptionStatus()

  const isMember =
    me?.roles && Array.isArray(me.roles) && me.roles.includes('member')

  const hub: typeof data['hub'] = {
    ...data.hub,
    items: data.hub.items.map((item) => {
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
      <h1
        className={css({
          mt: '8',
          mb: '8',
          position: 'absolute',
          width: 'full',
          height: '63vw',
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
          objectFit='contain'
          alt='Challenge Accepted Logo'
        />
      </h1>
      <section
        className={css({
          pt: '20vh',
          md: {
            pt: '30vh',
          },
        })}
      >
        <PersonBubble />
      </section>
      <Container>
        <div className={vstack({ gap: '32', alignItems: 'stretch' })}>
          <section className={css({ textStyle: 'pageIntro' })}>
            <StructuredText data={hub.introduction.value} />
          </section>
          {!isSubscribedToCANewsletter && <CANewsletterSignUp me={me} />}

          <section>
            <h2
              className={css({
                textStyle: 'h1Sans',
                fontWeight: 'bold',
                mb: '6',
              })}
            >
              Wer bei Challenge Accepted dabei ist
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
          {!isSubscribedToCANewsletter && <CANewsletterSignUp me={me} />}
          <div className={css({ textStyle: 'teaserLeadSans' })}>
            <StructuredText data={hub.outro.value} />
          </div>
        </div>
      </Container>
    </>
  )
}
