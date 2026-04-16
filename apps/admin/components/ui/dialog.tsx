'use client'

import { Dialog as RadixDialog } from 'radix-ui'
import { dialog } from '@republik/theme/recipes'
import { XIcon } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

const styles = dialog()

function Backdrop(props: RadixDialog.DialogOverlayProps) {
  return <RadixDialog.Overlay className={styles.backdrop} {...props} />
}

function Title(props: RadixDialog.DialogTitleProps) {
  return <RadixDialog.Title className={styles.title} {...props} />
}

function Description(props: RadixDialog.DialogDescriptionProps) {
  return <RadixDialog.Description className={styles.description} {...props} />
}

function Popup(props: RadixDialog.DialogContentProps) {
  return <RadixDialog.Content className={styles.popup} {...props} />
}

export function SimpleDialog({
  title,
  children,
  trigger,
  ...rootProps
}: PropsWithChildren<
  {
    title: ReactNode
    trigger?: ReactNode
  } & RadixDialog.DialogProps
>) {
  return (
    <RadixDialog.Root {...rootProps}>
      {trigger}
      <RadixDialog.Portal>
        <Backdrop />
        <div className={styles.viewport}>
          <Popup>
            <Title>{title}</Title>
            {children}
            <RadixDialog.Close className={styles.close}>
              <XIcon />
            </RadixDialog.Close>
          </Popup>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export const Dialog = {
  Root: RadixDialog.Root,
  Trigger: RadixDialog.Trigger,
  Portal: RadixDialog.Portal,
  Close: RadixDialog.Close,
  Backdrop,
  Popup,
  Title,
  Description,
}
