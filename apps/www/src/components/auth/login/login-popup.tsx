'use client'

import {
  PaynoteKindType,
  usePaynotes,
} from '@app/components/paynotes/paynotes-context'
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
        <Overlay title='Welcome back to Republik'>
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
                <div className={css({ mb: 4 })}>
                  <h2 className={css({ mb: 4 })}>Log in and keep on reading</h2>
                  <div className={css({ textStyle: 'airy' })}>
                    <ol>
                      <li>1. Confirm your email address.</li>
                      <li>2. Enter the verification code.</li>
                      <li>
                        3. Read the article you came for, and hopefully many
                        more.
                      </li>
                    </ol>
                  </div>
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
                  <Button variant='link' onClick={correctEmail}>
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

function isWalled(paynote: PaynoteKindType) {
  return ['PAYWALL', 'REGWALL', 'CAMPAIGN_OVERLAY_OPEN'].includes(paynote)
}

export function LoginPopup() {
  const router = useRouter()
  const { query } = router
  const email = query.email

  const { paynoteKind } = usePaynotes()

  if (!email || !isWalled(paynoteKind)) return null

  const decodedEmail = maybeDecode(email as string)

  if (!isEmail(decodedEmail)) return null

  return <Login email={decodedEmail} />
}
