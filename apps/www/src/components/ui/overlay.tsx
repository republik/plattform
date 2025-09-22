'use client'

import { Button } from '@app/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from '@republik/icons'

import { css } from '@republik/theme/css'

type ModalProps = {
  title: string
  children: React.ReactNode
}

export function Overlay({ title, children }: ModalProps) {
  return (
    <Dialog.Overlay
      // data-theme='dark'
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
        // data-theme='light'
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
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button aria-label='Close' variant='link'>
              <IconClose />
            </Button>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Overlay>
  )
}
