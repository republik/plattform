'use client'
import type { MeQuery } from '#graphql/republik-api/__generated__/gql/graphql'
import { getInitials } from '@/lib/context/getInitials'
import { useMe } from '@/lib/context/MeContext'
import { IconAccountBox } from '@republik/icons'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import Link from 'next/link'

export function Avatar() {
  const { meLoading, me } = useMe()

  if (meLoading) {
    return null
  }

  return me ? (
    <Link href='/meine-republik'>
      <UserAvatar {...me} />
    </Link>
  ) : (
    <Link
      href='/anmelden'
      className={css({
        textDecoration: 'none',
        color: 'text',
        fontSize: 's',
        md: { fontSize: 'base' },
      })}
    >
      Anmelden
    </Link>
  )
}

const UserAvatar = ({
  portrait,
  name,
  email,
}: Pick<MeQuery['me'], 'portrait' | 'email' | 'name'>) => {
  const style = css({
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: 'header.avatar',
    height: 'header.avatar',
    objectFit: 'cover',
    color: 'text',
    fontFamily: 'republikSerif',
    fontWeight: 'black',
    bg: 'hover',
  })

  return portrait ? (
    <Image
      src={portrait}
      height={32}
      width={32}
      className={style}
      alt='Portrait'
    />
  ) : (
    <span className={style}>{getInitials({ name, email })}</span>
  )
}
