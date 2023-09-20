import { css } from '@app/styled-system/css'
import { PEOPLE_QUERY } from '@app/graphql/cms/people.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import Image from 'next/image'

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client.query({
    query: PEOPLE_QUERY,
    context: {},
  })
  const { people } = data

  const now = new Date(Date.now()).toISOString()

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        maxWidth: 768,
        marginX: 'auto',
      })}
    >
      <h1 className={css({ textStyle: 'headingLarge' })}>CHALLENGE ACCEPTED</h1>
      <h2 className={css({ textStyle: '4xl', fontWeight: 'bold' })}>
        List of all people
      </h2>
      <ul className={css({ ml: '1rem' })}>
        {people.map((person) => (
          <li key={person.id}>
            <details>
              <summary>
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
              </summary>
              <pre>
                <code>{JSON.stringify(person, null, 2)}</code>
              </pre>
            </details>
          </li>
        ))}
      </ul>
      <p>Rendered-at: {now}</p>
    </div>
  )
}
