'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { dialog } from '@republik/theme/recipes'
import { XIcon } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

const styles = dialog()

function Backdrop(props: BaseDialog.Backdrop.Props) {
  return <BaseDialog.Backdrop className={styles.backdrop} {...props} />
}

function Title(props: BaseDialog.Title.Props) {
  return <BaseDialog.Title className={styles.title} {...props} />
}

function Description(props: BaseDialog.Description.Props) {
  return <BaseDialog.Description className={styles.description} {...props} />
}

function Popup(props: BaseDialog.Popup.Props) {
  return <BaseDialog.Popup className={styles.popup} {...props} />
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
  } & BaseDialog.Root.Props
>) {
  return (
    <BaseDialog.Root {...rootProps}>
      {trigger}
      <BaseDialog.Portal>
        <Backdrop />
        <BaseDialog.Viewport className={styles.viewport}>
          <Popup>
            <Title>{title}</Title>
            {children}
            <BaseDialog.Close className={styles.close}>
              <XIcon />
            </BaseDialog.Close>
          </Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

export const Dialog = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Close: BaseDialog.Close,
  Backdrop,
  Popup,
  Title,
  Description,
}
