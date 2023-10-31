import { Collapsible } from './collapsible'
import { CHALLENGE_ACCEPTED_PERSON_LIST_QUERY } from '@app/graphql/cms/person-list.query'
import type { ChallengeAcceptedPersonListQueryQuery } from '@app/graphql/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import Image from 'next/image'
import Link from 'next/link'

type Person = ChallengeAcceptedPersonListQueryQuery['people'][number]

const PersonListItem = ({ person }: { person: Person }) => {
  return (
    <li
      className={css({
        listStyle: 'none',
        display: 'block',
        width: 'full',
      })}
    >
      <Link
        href={`/challenge-accepted/person/${person.slug}`}
        className={hstack({
          gap: '4',
          color: 'text',
          textDecoration: 'none',
          _hover: {
            bg: 'contrast',
            color: 'text.inverted',
          },
          width: 'full',
          py: '1',
        })}
      >
        {person.portrait && (
          <Image
            className={css({ height: '60px', width: 'auto' })}
            unoptimized
            src={person.portrait.url}
            width={person.portrait.width}
            height={person.portrait.height}
            alt={`Portrait von ${person.name}`}
          />
        )}
        <span className={css({ textStyle: 'h2Sans' })}>{person.name}</span>
      </Link>
    </li>
  )
}

export async function PersonList() {
  const { data } = await getCMSClient().query({
    query: CHALLENGE_ACCEPTED_PERSON_LIST_QUERY,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  return (
    <div>
      <Collapsible
        shownItems={data.people
          ?.filter((p) => p.size === 'large')
          .map((p) => (
            <PersonListItem person={p} key={p.id} />
          ))}
        collapsedItems={data.people
          ?.filter((p) => p.size !== 'large')
          .map((p) => (
            <PersonListItem person={p} key={p.id} />
          ))}
      />
    </div>
  )
}
