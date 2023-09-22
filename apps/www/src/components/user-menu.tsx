'use client'

import { MeQueryResult } from '@app/graphql/republik-api/me.query'
import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'
import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from '@republik/icons'
import Link from 'next/link'
// import UserNav from 'components/Frame/Popover/UserNav'

type Props = MeQueryResult

const getInitials = (me) =>
  (me.name && me.name.trim()
    ? me.name.split(' ').filter((n, i, all) => i === 0 || all.length - 1 === i)
    : me.email
        .split('@')[0]
        .split(/\.|-|_/)
        .slice(0, 2)
  )
    .slice(0, 2)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')

const Avatar = ({ me }: Props) => {
  const style = css({
    position: 'relative',
    display: 'inline-block',
    width: 'header.avatar',
    height: 'header.avatar',
  })

  return me.portrait ? (
    <img src={me.portrait} className={style} alt='Portrait' />
  ) : (
    <span className={style}>{getInitials(me)}</span>
  )
}

export const UserMenu = ({ me }: Props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>
          <Avatar me={me} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            position: 'fixed',
            inset: 'token(sizes.header.height) 0 0 0',
            backgroundColor: 'challengeAccepted.background',
          })}
        />
        <Dialog.Content
          className={css({
            position: 'fixed',
            top: 'header.height',
          })}
        >
          <div
            className={vstack({
              gap: '4',
              p: '4',
              maxWidth: 768,
              mx: 'auto',
              alignItems: 'flex-start',
            })}
          >
            <Link href='/benachrichtigungen'>Benachrichtigungen</Link>
            <Link href='/konto'>Konto</Link>
            <Link href={`~${me.slug}`}>Profil</Link>
          </div>

          {/* <UserNav /> */}

          {/* <Dialog.Title className={css({ textStyle: '5xl' })}>
            HALLOO
          </Dialog.Title>
          <Dialog.Description /> */}
          <Dialog.Close asChild>
            <button
              className={css({ position: 'fixed', top: '4', right: '4' })}
            >
              <IconClose size={24} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
