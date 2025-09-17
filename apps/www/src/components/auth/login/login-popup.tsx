'use client'

import * as Dialog from '@radix-ui/react-dialog'

import { LoginForm } from '../login'

export function LoginPopup() {
  console.log('Render LoginPopup')
  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Welcome back</Dialog.Title>
          <Dialog.Description>
            Log into your account and continue reading
          </Dialog.Description>
          <LoginForm
            analyticsProps={{}}
            defaultEmail='anna.traussnig@republik.ch'
          />
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
