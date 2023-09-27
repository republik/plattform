import type { Metadata } from 'next'

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

export async function generateMetadata(): Promise<Metadata> {
  const client = getCMSClient()
  const { data } = await client.query({
    query: CHALLENGE_ACCEPTED_HUB_META_QUERY,
  })

  return {
    title: data.hub?.metadata?.title,
    description: data.hub?.metadata?.description,
    openGraph: {
      images: data.hub?.metadata?.image?.url,
    },
  }
}

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client.query({
    query: CHALLENGE_ACCEPTED_HUB_QUERY,
    context: {},
  })
  const { people, hub } = data

  const now = new Date(Date.now()).toISOString()

  return (
    <>
      <h1 className={css({ mb: '9', _dark: { filter: 'invert(1)' } })}>
        <img
          src={hub.logo?.url}
          className={css({
            width: '100vw',
            height: 'auto',
          })}
          alt='Challenge Accepted Logo'
        ></img>
      </h1>
      <Container>
        <h2 className={css({ textStyle: '4xl', fontWeight: 'bold', mb: '6' })}>
          Personen
        </h2>
        <div className={wrap({ gap: '4', mb: '6' })}>
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
                    textStyle: '2xl',
                    fontWeight: 'bold',
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
                        width: '96px',
                        height: '96px',
                        objectFit: 'cover',
                      })}
                      alt={person.name}
                    />
                  ) : (
                    <div
                      className={css({
                        borderRadius: 'full',
                        width: '96px',
                        height: '96px',
                        background: 'contrast',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'background',
                        fontSize: '4xl',
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
        </div>
        <h2 className={css({ textStyle: '4xl', fontWeight: 'bold', my: '6' })}>
          Inhalte
        </h2>
        <CollectionRenderer items={hub.items} />
      </Container>
      <h2 className={css({ textStyle: '3xl', mt: '6' })}>Additonal hub data</h2>
      <details>
        <summary>hub</summary>
        <pre>{JSON.stringify(hub.introduction, null, 2)}</pre>
      </details>

      <p>Rendered-at: {now}</p>
    </>
  )
}
