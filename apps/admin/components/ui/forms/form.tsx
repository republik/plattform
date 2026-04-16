import { Form as RadixForm } from 'radix-ui'
import { css } from '@republik/theme/css'

export function Form(props: RadixForm.FormProps) {
  return (
    <RadixForm.Root
      className={css({
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'flex-start',
        gap: '4',
      })}
      {...props}
    />
  )
}
