'use client'

import { Button } from '@app/components/ui/button'
import { Overlay } from '@app/components/ui/overlay'
import * as Dialog from '@radix-ui/react-dialog'

import { css } from '@republik/theme/css'
import { useRouter } from 'next/router'
import { useState } from 'react'
import isEmail from 'validator/lib/isEmail'
import { maybeDecode } from '../../../../lib/utils/base64u'

import { LoginForm } from '../login'

function Login({ email }: { email: string }) {
  const [defaultEmail, setDefaultEmail] = useState<string>(email)
  const [autofocus, setAutofocus] = useState<boolean>(false)

  function correctEmail() {
    setDefaultEmail('')
    setAutofocus(true)
  }

  return (
    <Dialog.Root defaultOpen={true}>
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
              renderBefore={
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
              }
              renderAfter={
                <div
                  className={css({
                    marginTop: 2,
                    fontSize: 's',
                    lineHeight: 1.4,
                    color: 'textSoft',
                    textAlign: 'center',
                  })}
                >
                  <Button variant='link' size='large' onClick={correctEmail}>
                    Not your email address?
                  </Button>
                </div>
              }
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
  const router = useRouter()
  const { query } = router
  const email = query.email

  if (!email) return null

  const decodedEmail = maybeDecode(email as string)

  if (!isEmail(decodedEmail)) return null

  return <Login email={decodedEmail} />
}
