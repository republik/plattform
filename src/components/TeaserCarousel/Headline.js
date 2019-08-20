import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { fontStyles } from '../../theme/fonts'

import CarouselContext from './Context'

const styles = {
  base: css({
    margin: '0 0 10px 0'
  }),
  editorial: css({
    ...fontStyles.serifTitle,
    fontSize: 19,
    lineHeight: '22px'
  }),
  interaction: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 19,
    lineHeight: '22px'
  }),
  scribble: css({
    ...fontStyles.cursiveTitle,
    fontSize: 19,
    lineHeight: '22px'
  }),
  bigger: css({ fontSize: 28, lineHeight: '28px' })
}

export const Editorial = ({ children, bigger: biggerProp }) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.editorial,
    bigger && styles.bigger
  )

  return <h1 {...headlineStyles}>{children}</h1>
}

export const Interaction = ({ children, bigger: biggerProp }) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.interaction,
    bigger && styles.bigger
  )
  return <h1 {...headlineStyles}>{children}</h1>
}

export const Scribble = ({ children, bigger: biggerProp }) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.scribble,
    bigger && styles.bigger
  )
  return <h1 {...headlineStyles}>{children}</h1>
}

Editorial.propTypes = {
  children: PropTypes.node,
  bigger: PropTypes.bool
}
Editorial.defaultProps = {
  bigger: false
}

Interaction.propTypes = {
  children: PropTypes.node,
  bigger: PropTypes.bool
}
Interaction.defaultProps = {
  bigger: false
}

Scribble.propTypes = {
  children: PropTypes.node,
  bigger: PropTypes.bool
}
Scribble.defaultProps = {
  bigger: false
}
