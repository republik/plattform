'use client'

import { UserProfileDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { Avatar } from './user-avatar'

export function UserHeader({ userId }: { userId: string }) {
  const { data } = useQuery(UserProfileDocument, {
    variables: {
      id: userId,
    },
  })

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4',
        padding: '4',
      })}
    >
      {!data?.user ? (
        <div
          className={css({
            width: '[36px]',
            height: '[36px]',
            backgroundColor: 'hover',
          })}
        />
      ) : (
        <>
          <Link
            href={`/users/${userId}`}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4',
            })}
          >
            <Avatar {...data.user} />
            <h2 className={css({ fontSize: 'xl', fontWeight: 'medium' })}>
              <span>{data.user.name}</span>
            </h2>
          </Link>

          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4',
              fontSize: 's',
              justifySelf: 'flex-end',
            })}
          >
            <Link href={`mailto:${data.user.email}`}>{data.user.email}</Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_REPUBLIK_FRONTEND_URL}/~${data.user.slug}`}
            >
              Profil {data.user.hasPublicProfile ? '(öffentlich)' : '(privat)'}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
