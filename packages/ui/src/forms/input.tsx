import { Input as BaseInput } from '@base-ui/react'
import { css } from '@republik/theme/css'
export function Input(props: BaseInput.Props) {
  return (
    <BaseInput
      className={css({
        background: 'white',
        borderWidth: '1px',
        borderColor: 'divider',
        borderRadius: '[5px]',
        p: '2',
        _focus: { borderColor: 'text', outline: 'none' },
        _disabled: {
          color: 'text.secondary',
          background: 'disabled',
        },
        _readOnly: {
          color: 'text.secondary',
          background: 'disabled',
        },
        _placeholder: {
          color: 'text.tertiary',
          fontWeight: 'regular',
        },
        _invalid: {
          borderColor: 'error',
          color: 'error',
        },
      })}
      {...props}
    />
  )
}
