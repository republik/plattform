import CollectionRenderer from '@app/components/collection-render'
import type { PersonDetailQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import Image from 'next/image'

type PersonDetailProps = {
  person: PersonDetailQuery['person']
}

export function PersonDetail({ person }: PersonDetailProps) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
      })}
    >
      {person.portrait && (
        <Image
          alt={person.name}
          src={person.portrait.url}
          width={500}
          height={500}
        />
      )}
      <h1
        className={css({
          textStyle: 'headingLarge',
        })}
      >
        Sali, ich bin {person.name}
      </h1>

      <h2 className={css({ textStyle: '4xl', fontWeight: 'bold', my: '6' })}>
        Inhalte
      </h2>

      <CollectionRenderer items={person.items} />
      <div className={css({ mt: '6' })}>
        <details>
          <summary>person data</summary>
          <pre>{JSON.stringify(person, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}
