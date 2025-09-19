'use client'

import {
  PaynoteKindType,
  usePaynotes,
} from '@app/components/paynotes/paynotes-context'
import { Button } from '@app/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from '@republik/icons'

import { css } from '@republik/theme/css'
import { useState } from 'react'

import { LoginForm } from '../login'

function isWalled(paynote: PaynoteKindType) {
  return ['PAYWALL', 'REGWALL', 'CAMPAIGN_OVERLAY_OPEN'].includes(paynote)
}

export function LoginPopup() {
  const [defaultEmail, setDefaultEmail] = useState<string>(
    'anna.traussnig@gmail.com',
  )
  const [autofocus, setAutofocus] = useState<boolean>(false)

  const { paynoteKind } = usePaynotes()

  if (!isWalled(paynoteKind)) return null

  function correctEmail() {
    setDefaultEmail('')
    setAutofocus(true)
  }

  return (
    <Dialog.Root defaultOpen={true}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-theme='dark'
          className={css({
            backgroundColor: 'overlay',
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            '@media print': {
              display: 'none',
            },
          })}
        >
          <Dialog.Content
            data-theme='light'
            className={css({
              backgroundColor: 'background',
              zIndex: 99999,
              boxShadow: 'sm',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: 'content.narrow',
              maxHeight: '85vh',
              _stateOpen: { animation: 'fadeIn' },
              _stateClosed: {
                animation: 'fadeOut',
              },
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
                padding: 4,
              })}
            >
              <Dialog.Title className={css({ textStyle: 'sansSerifMedium' })}>
                Welcome back to Republik
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button aria-label='Close' variant='link'>
                  <IconClose />
                </Button>
              </Dialog.Close>
            </div>

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
                    <h2 className={css({ mb: 4 })}>
                      Log in and keep on reading
                    </h2>
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
                    Not the right email address? You can always{' '}
                    <Button variant='link' onClick={correctEmail}>
                      correct it.
                    </Button>
                  </div>
                }
                analyticsProps={{}}
                defaultEmail={defaultEmail}
                autoFocus={autofocus}
                key={defaultEmail} // reset form when email is changed
              />
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
