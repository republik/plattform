import { css } from '@republik/theme/css'
import { ComponentPropsWithoutRef } from 'react'

export { default as Header } from './Header'

export const Body = (props: ComponentPropsWithoutRef<'div'>) => {
  return (
    <div
      {...props}
      className={css({
        display: 'grid',
        gridTemplateRows: '[max-content 1fr]',
        height: '[100dvh]',
      })}
    ></div>
  )
}

export const Content = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={css({ p: '4', position: 'relative', overflowY: 'auto' })}
  ></div>
)
