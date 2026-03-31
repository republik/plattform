import { Form as BaseForm } from '@base-ui/react'
import { css } from '@republik/theme/css'

export function Form(props: BaseForm.Props) {
  return (
    <BaseForm
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
