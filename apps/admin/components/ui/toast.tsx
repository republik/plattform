'use client'
import { Toast as BaseToast } from '@base-ui/react'
import { toast } from '@republik/theme/recipes'
import { XIcon } from 'lucide-react'
import { Button } from './button'

const styles = toast()

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <BaseToast.Provider timeout={0}>
      <BaseToast.Portal>
        <BaseToast.Viewport className={styles.viewport}>
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
      {children}
    </BaseToast.Provider>
  )
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager()

  return toasts.map((toast) => (
    <BaseToast.Root key={toast.id} toast={toast} className={styles.root}>
      <BaseToast.Content className={styles.content}>
        <BaseToast.Title className={styles.title} />
        <BaseToast.Description className={styles.description} />
        <BaseToast.Close className={styles.close} aria-label='Close'>
          <XIcon size={16} />
        </BaseToast.Close>
        <BaseToast.Action render={<Button size='small' />} />
      </BaseToast.Content>
    </BaseToast.Root>
  ))
}

export const useToastManager = BaseToast.useToastManager
