'use client'

import { Button } from '@app/components/ui/button'
import { Overlay } from '@app/components/ui/overlay'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import * as Dialog from '@radix-ui/react-dialog'

import { css } from '@republik/theme/css'
import { useRouter } from 'next/router'
import { useState } from 'react'
import isEmail from 'validator/lib/isEmail'
import { useMe } from '../../../../lib/context/MeContext'
import { maybeDecode } from '../../../../lib/utils/base64u'

import { LoginForm } from '../login'

function LoginHeader() {
  return (
    <div
      className={css({
        mb: '8-16',
        textAlign: 'center',
      })}
    >
      <h2>
        <Dialog.Title className={css({ mb: 4 })}>
          Looks like you are a subscriber
        </Dialog.Title>
      </h2>
      <p className={css({ textStyle: 'airy' })}>
        Please, <b>log in to read the article.</b>
      </p>
    </div>
  )
}

function ResetButton({ onClick }) {
  return (
    <div
      className={css({
        marginTop: 2,
        fontSize: 's',
        lineHeight: 1.4,
        color: 'textSoft',
        textAlign: 'center',
      })}
    >
      <Button variant='link' size='large' onClick={onClick}>
        Not your email address?
      </Button>
    </div>
  )
}

function Login({ email }: { email: string }) {
  const [defaultEmail, setDefaultEmail] = useState<string>(email)
  const [autofocus, setAutofocus] = useState<boolean>(false)
  const router = useRouter()

  function removeEmailFromQuery() {
    const { email: emailParam, ...query } = router.query
    router.replace(
      {
        query,
      },
      undefined,
      { shallow: true },
    )
  }

  function resetEmail() {
    setDefaultEmail('')
    setAutofocus(true)
  }

  return (
    <Dialog.Root defaultOpen={true} onOpenChange={removeEmailFromQuery}>
      <Dialog.Portal>
        <Overlay>
          <div
            className={css({
              padding: 4,
              '& h2': {
                textStyle: 'h2Sans',
              },
            })}
          >
            <LoginForm
              context='signIn'
              renderBefore={<LoginHeader />}
              renderAfter={<ResetButton onClick={resetEmail} />}
              analyticsProps={{ variation: 'prefilled login popup' }}
              defaultEmail={defaultEmail}
              autoFocus={autofocus}
              key={defaultEmail} // reset form when email is changed
            />
          </div>
        </Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function LoginPopup() {
  const { meLoading, me } = useMe()
  const router = useRouter()
  const {
    query: { email, ...restQuery },
  } = router

  if (meLoading || me) {
    router.replace(
      {
        query: restQuery,
      },
      undefined,
      { shallow: true },
    )
    return null
  }

  if (!email) return null

  const decodedEmail = maybeDecode(email as string)
  if (!isEmail(decodedEmail)) return null

  return (
    <EventTrackingContext category='SimplifiedLogin'>
      <Login email={decodedEmail} />
    </EventTrackingContext>
  )
}
