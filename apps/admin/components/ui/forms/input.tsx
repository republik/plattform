import { Form as RadixForm } from 'radix-ui'
import { css } from '@republik/theme/css'

export function Input(props: React.ComponentPropsWithoutRef<'input'>) {
  return (
    <RadixForm.Control
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
        // _invalid: {
        //   borderColor: 'error',
        //   color: 'error',
        // },
      })}
      {...props}
    />
  )
}
