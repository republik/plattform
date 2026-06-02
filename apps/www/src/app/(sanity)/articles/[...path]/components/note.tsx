import { css } from '@republik/theme/css'
import { editorialWidthAttrs } from '../styles'

export function Note({ children }) {
  return (
    <p
      className={css({
        textStyle: 'sans',
        fontSize: 'xs',
        md: {
          fontSize: 's',
        },
        ...editorialWidthAttrs,
      })}
    >
      {children}
    </p>
  )
}
