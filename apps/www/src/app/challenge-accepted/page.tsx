import type { Metadata, ResolvingMetadata } from 'next'

import { PersonBubble } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'
import { CANewsletterSignUp } from '@app/app/challenge-accepted/components/ca-newsletter-sign-up'
import { CollectionFilter } from '@app/app/challenge-accepted/components/collection-filter'
import CollectionRenderer from '@app/app/challenge-accepted/components/collection-render'
import Container from '@app/components/container'
import {
  CHALLENGE_ACCEPTED_HUB_META_QUERY,
  CHALLENGE_ACCEPTED_HUB_QUERY,
} from '@app/graphql/cms/hub.query'
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

  const { title, description, image } = data.hub?.metadata || {}

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
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
  const { data } = await getCMSClient().query({
    query: CHALLENGE_ACCEPTED_HUB_QUERY,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  const me = await getMe()

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
          pt: 'min(50vw, 500px)',
          // mx: '-4',
          overflow: 'hidden',
        })}
      >
        <PersonBubble />
      </section>
      <Container>
        <div className={vstack({ gap: '16-32', alignItems: 'stretch' })}>
          <section className={css({ textStyle: 'pageIntro' })}>
            <StructuredText data={hub.introduction.value} />
          </section>

          <CANewsletterSignUp me={me} id='newsletter' />

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
            title='Keine neuen Beiträge und Verstaltungen verpassen: für den
                  Newsletter anmelden.'
            me={me}
          />
          <div className={css({ textStyle: 'paragraph' })}>
            <StructuredText data={hub.outro.value} />
          </div>
        </div>
      </Container>
    </>
  )
}
