import { css } from '@app/styled-system/css'
import { PEOPLE_QUERY } from '@app/graphql/cms/people.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@app/components/container'

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client.query({
    query: PEOPLE_QUERY,
    context: {},
  })
  const { people } = data

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
