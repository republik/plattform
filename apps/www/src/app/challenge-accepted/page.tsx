import type { Metadata, MetadataRoute, ResolvingMetadata } from 'next'

import { css } from '@app/styled-system/css'
import {
  CHALLENGE_ACCEPTED_HUB_META_QUERY,
  CHALLENGE_ACCEPTED_HUB_QUERY,
} from '@app/graphql/cms/hub.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@app/components/container'
import CollectionRenderer from '@app/components/collection-render'
import { vstack, wrap } from '@app/styled-system/patterns'
import { getMe } from '@app/lib/auth/me'
import { CollectionFilter } from '@app/components/collection-filter'
import { StructuredText } from 'react-datocms'
import { CANewsletterSignUp } from '@app/components/ca-newsletter-sign-up'
import { getClimateLabNewsletterSubscriptionStatus } from '@app/graphql/republik-api/newsletter.query'
import { PersonList } from '@app/app/challenge-accepted/person/[slug]/components/person-list'

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
  const { people } = data

  return (
    <>
      {}
      <h1
        className={css({
          mb: '8',
          _dark: {
            filter: 'invert(1)',
          },
        })}
      >
        <img
          src={hub.logo?.url}
          className={css({
            width: 'viewportWidth',
            height: 'auto',
          })}
          alt='Challenge Accepted Logo'
        ></img>
      </h1>
      <Container>
        <div className={vstack({ gap: '32', alignItems: 'stretch' })}>
          <section className={wrap({ gap: '4', mb: '6' })}>
            {people.map((person) => (
              <div
                key={person.id}
                className={css({
                  display: 'flex',
                  flexDirection: 'row',
                  // justifyContent: 'flex-end',
                  gap: '4',
                })}
              >
                <Link href={`/challenge-accepted/person/${person.slug}`}>
                  <h3
                    className={css({
                      display: 'block',
                      textStyle: 'h3Sans',
                      textAlign: 'center',
                      py: '1',
                    })}
                  >
                    {person.portrait ? (
                      <Image
                        src={person.portrait?.url}
                        width={96 * 2}
                        height={96 * 2}
                        className={css({
                          borderRadius: 'full',
                          width: '24',
                          height: '24',
                          objectFit: 'cover',
                        })}
                        alt={person.name}
                      />
                    ) : (
                      <div
                        className={css({
                          borderRadius: 'full',
                          width: '24',
                          height: '24',
                          background: 'contrast',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'pageBackground',
                          fontSize: '3xl',
                        })}
                      >
                        {person.name.slice(0, 1)}
                      </div>
                    )}
                    {person.name}
                  </h3>
                </Link>
              </div>
            ))}
          </section>

          <section className={css({ textStyle: 'pageIntro' })}>
            <StructuredText data={hub.introduction.value} />
          </section>
          {!isSubscribedToCANewsletter && (
            <CANewsletterSignUp defaultEmail={me ? me.email : undefined} />
          )}

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
          {!isSubscribedToCANewsletter && (
            <CANewsletterSignUp defaultEmail={me ? me.email : undefined} />
          )}
          <div className={css({ textStyle: 'teaserLeadSans' })}>
            <StructuredText data={hub.outro.value} />
          </div>
        </div>
      </Container>
    </>
  )
}
