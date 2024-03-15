import { css } from '@app/styled-system/css'

export const Center = (props) => {
  return <div className={css({ maxWidth: 900, margin: 'auto' })} {...props} />
}
