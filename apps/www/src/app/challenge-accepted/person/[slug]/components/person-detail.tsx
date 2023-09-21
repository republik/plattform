'use client'

import { PersonDetailQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import Link from 'next/link'

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
      <Link href='/challenge-accepted'>Challenge Accepted</Link>
      <Image
        alt={person.name}
        src={person.portrait.url}
        width={500}
        height={500}
      />
      <h1
        className={css({
          textStyle: 'headingLarge',
        })}
      >
        Hallo, ich bin {person.name}
      </h1>
    </div>
  )
}
