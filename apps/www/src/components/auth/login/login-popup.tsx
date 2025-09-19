'use client'

import { Button } from '@app/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from '@republik/icons'

import { css } from '@republik/theme/css'
import { useState } from 'react'

import { LoginForm } from '../login'

export function LoginPopup() {
  const [defaultEmail, setDefaultEmail] = useState<string>(
    'anna.traussnig@gmail.com',
  )
  const [autofocus, setAutofocus] = useState<boolean>(false)

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
                Welcome back
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button aria-label='Close' variant='link'>
                  <IconClose />
                </Button>
              </Dialog.Close>
            </div>

            <div className={css({ padding: 4 })}>
              <Dialog.Description>
                Log into your account and keep on reading.
              </Dialog.Description>
              <div className={css({ marginTop: 4 })}>
                <LoginForm
                  analyticsProps={{}}
                  defaultEmail={defaultEmail}
                  autoFocus={autofocus}
                  key={defaultEmail} // reset form when email is changed
                />
              </div>
              <div className={css({ marginTop: 2 })}>
                <small>
                  Not the right email address? You can{' '}
                  <Button variant='link' onClick={correctEmail}>
                    correct it.
                  </Button>
                </small>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
