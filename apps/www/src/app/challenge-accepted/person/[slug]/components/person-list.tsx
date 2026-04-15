import { Collapsible } from '@app/app/challenge-accepted/components/collapsible'
import {
  ChallengeAcceptedPersonListDocument,
  type ChallengeAcceptedPersonListQuery,
} from '#graphql/cms/__generated__/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import Image from 'next/image'
import Link from 'next/link'

type Person = ChallengeAcceptedPersonListQuery['people'][number]

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
          p: '2',
        })}
      >
        {person.portrait && (
          <Image
            className={css({
              height: '60px',
              width: '60px',
              objectFit: 'contain',
            })}
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

export async function PersonList({
  linkToOverview,
  hidePersonId,
}: {
  linkToOverview?: boolean
  hidePersonId?: string
}) {
  const client = await getCMSClient()
  const { data } = await client.query({
    query: ChallengeAcceptedPersonListDocument,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  const collapsedItems = data.people
    ?.filter((p) => p.size !== 'large' && p.id !== hidePersonId)
    .map((p) => <PersonListItem person={p} key={p.id} />)
  const shownItems =
    data.people
      ?.filter((p) => p.size === 'large' && p.id !== hidePersonId)
      .map((p) => <PersonListItem person={p} key={p.id} />) ?? []

  if (linkToOverview) {
    shownItems.unshift(
      <li
        key='home'
        className={css({
          listStyle: 'none',
          display: 'block',
          width: 'full',
        })}
      >
        <Link
          href={`/challenge-accepted/2023`}
          className={hstack({
            gap: '4',
            color: 'text',
            textDecoration: 'none',
            _hover: {
              bg: 'contrast',
              color: 'text.inverted',
              '& img': { filter: 'invert(1)' },
            },
            _dark: {
              '& img': { filter: 'invert(1)' },
              _hover: {
                '& img': { filter: 'none' },
              },
            },
            width: 'full',
            p: '2',
          })}
        >
          {data.hub?.logo && (
            <Image
              className={css({
                height: '60px',
                width: '60px',
                objectFit: 'contain',
              })}
              unoptimized
              src={data.hub?.logo?.url}
              width={200}
              height={200}
              alt={`Challenge Accepted Logo`}
            />
          )}
          <span className={css({ textStyle: 'h2Sans' })}>Übersicht</span>
        </Link>
      </li>,
    )
  }

  return (
    <div
      className={css({
        '& [data-collapsible]': {
          borderColor: 'contrast',
          borderStyle: 'solid',
          borderTopWidth: 1,
          borderBottomWidth: 1,
        },
        '& [data-collapsible-trigger]': {
          color: 'contrast',
          cursor: 'pointer',
          textAlign: 'center',
          width: 'full',
          mt: '4',
        },
      })}
    >
      <Collapsible shownItems={shownItems} collapsedItems={collapsedItems} />
    </div>
  )
}
