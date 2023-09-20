import { css } from '@app/styled-system/css'
import { PEOPLE_QUERY } from '@app/graphql/cms/people.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'

export default async function Page() {
  const client = getCMSClient()
  const { data } = await client
    .query({
      query: PEOPLE_QUERY,
      context: {},
    })
    .catch((err) => {
      console.error('FETCH_ERROR' + JSON.stringify(err, null, 2))
      return { data: { people: [] } }
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
