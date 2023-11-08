'use client'
import { css } from '@app/styled-system/css'
import * as Dialog from '@radix-ui/react-dialog'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { IconClose } from '@republik/icons'

export function ShareOverlay(props: {
  triggerLabel: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>{props.triggerLabel}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            position: 'fixed',
            inset: '0',
            display: 'grid',
            placeItems: 'center',
            overflowY: 'auto',
            background: 'overlay',
          })}
        >
          <Dialog.Content
            className={css({
              m: '8',
              position: 'relative',
              background: 'background',
              w: 'full',
              maxW: 400,
            })}
          >
            <Dialog.Title>Teilen</Dialog.Title>
            <VisuallyHidden>
              <Dialog.Description></Dialog.Description>
            </VisuallyHidden>
            {props.children}
            <Dialog.Close
              className={css({ position: 'absolute', top: '4', right: '4' })}
            >
              <IconClose size={24} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
