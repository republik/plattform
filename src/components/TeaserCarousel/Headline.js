import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import {
  serifTitle16,
  serifTitle28,
  sansSerifMedium20,
  cursiveTitle20
} from '../Typography/styles'

const styles = {
  base: css({
    margin: '0 0 10px 0'
  }),
  editorial: css({ ...serifTitle16, lineHeight: '24px' }),
  interaction: css({ ...sansSerifMedium20, lineHeight: '28px' }),
  scribble: css({ ...cursiveTitle20, lineHeight: '28px' }),
  serie: css({ ...serifTitle28 })
}

export const Editorial = ({ children }) => {
  let headlineStyles = css(styles.base, styles.editorial)
  return <h1 {...headlineStyles}>{children}</h1>
}

export const Interaction = ({ children }) => {
  let headlineStyles = css(styles.base, styles.interaction)
  return <h1 {...headlineStyles}>{children}</h1>
}

export const Scribble = ({ children }) => {
  let headlineStyles = css(styles.base, styles.scribble)
  return <h1 {...headlineStyles}>{children}</h1>
}
export const Serie = ({ children }) => {
  let headlineStyles = css(styles.base, styles.serie)
  return <h1 {...headlineStyles}>{children}</h1>
}

Editorial.propTypes = {
  children: PropTypes.node
}

// export default Headline
