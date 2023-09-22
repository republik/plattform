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
    <Container>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
          maxWidth: 768,
          marginX: 'auto',
        })}
      >
        <h1 className={css({ textStyle: 'headingLarge' })}>
          CHALLENGE ACCEPTED
        </h1>
        <div>
          <CollectionRenderer items={hub.items} />
          <h2 className={css({ textStyle: '3xl' })}>Additonal hub data</h2>
          <details>
            <summary>hub</summary>
            <pre>{JSON.stringify(hub.introduction, null, 2)}</pre>
          </details>
        </div>
        <h2 className={css({ textStyle: '4xl', fontWeight: 'bold' })}>
          List of all people
        </h2>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoRows: 'auto',
          })}
        >
          {people.map((person) => (
            <div
              key={person.id}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                padding: '1rem',
                margin: '1rem',
                border: '1px solid black',
              })}
            >
              {person.portrait && (
                <Image
                  alt={person.name}
                  src={person.portrait.url}
                  width={100}
                  height={100}
                  style={{ objectFit: 'contain' }}
                />
              )}
              <h3
                className={css({
                  display: 'inline-block',
                  textStyle: '2xl',
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                })}
              >
                {person.name}
              </h3>
              <Link href={`/challenge-accepted/person/${person.slug}`}>
                More
              </Link>
            </div>
          ))}
        </div>
        <p>Rendered-at: {now}</p>
      </div>
    </Container>
  )
}
